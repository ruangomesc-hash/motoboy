import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { ZodError } from "zod";
import type { Env } from "@motoboy/types";
import type { Redis as RedisClient } from "ioredis";
import { loadEnv } from "./lib/env.js";
import { getRedis, isRedisEnabled } from "./lib/redis.js";
import { EvolutionService } from "./services/evolution.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { authRoutes } from "./routes/auth.js";
import { meRoutes } from "./routes/me.js";
import { adminRoutes } from "./routes/admin.js";
import type { EvolutionService as EvoType } from "./services/evolution.js";
import { mapPrismaHttpError } from "./lib/prisma-http.js";

declare module "fastify" {
  interface FastifyInstance {
    config: { env: Env };
    redis: RedisClient | null;
    evolution: EvoType;
  }
}

export type CreateAppOptions = {
  env?: Env;
  logger?: boolean;
};

export async function createApp(
  options: CreateAppOptions = {},
): Promise<FastifyInstance> {
  const env = options.env ?? loadEnv();
  const app = Fastify({ logger: options.logger ?? true });

  // DELETE/GET com Content-Type: application/json e corpo vazio (ex.: fetch do app).
  app.removeContentTypeParser("application/json");
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_request, body, done) => {
      if (body === "" || body === undefined || body === null) {
        done(null, undefined);
        return;
      }
      try {
        const json = JSON.parse(body as string) as unknown;
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.setErrorHandler((error: unknown, request, reply) => {
    if (reply.sent) {
      request.log.error({ err: error }, "error after response was sent");
      return;
    }
    const err = error as { code?: string; name?: string; message?: string };
    if (
      err.code === "FST_ERR_REP_ALREADY_SENT" ||
      err.message?.includes("Reply was already sent")
    ) {
      request.log.error({ err: error }, "duplicate reply prevented");
      return;
    }
    const prismaMapped = mapPrismaHttpError(error);
    if (prismaMapped) {
      app.log.error(error);
      return reply.status(prismaMapped.status).send(prismaMapped.body);
    }
    if (err.name === "PrismaClientValidationError") {
      app.log.error(error);
      return reply.status(400).send({
        error: "Dados da entrega inválidos. Confira valor, origem e data.",
        code: "PRISMA_VALIDATION",
      });
    }
    if (
      err.message?.includes(
        "Prisma Client could not locate the Query Engine for runtime",
      )
    ) {
      app.log.error(error);
      return reply.status(503).send({
        error:
          "Falha de runtime Prisma no deploy. Rode redeploy no commit mais recente (fix de tracing) e tente novamente.",
        code: "PRISMA_ENGINE_MISSING",
      });
    }
    if (error instanceof ZodError) {
      const first = error.errors[0]?.message ?? "Dados inválidos";
      return reply.status(400).send({
        error: first,
        code: "VALIDATION_ERROR",
      });
    }
    if (
      err.message?.includes("Body cannot be empty when content-type is set to")
    ) {
      return reply.status(400).send({ error: "Corpo da requisição inválido" });
    }
    app.log.error(error);
    const path = request.url.split("?")[0] ?? "";
    const isAdminMutation =
      path.includes("/admin/users/") &&
      (request.method === "DELETE" || request.method === "PUT");
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return reply.status(500).send({
      error: isAdminMutation
        ? message.slice(0, 240)
        : process.env.NODE_ENV === "production"
          ? "Erro interno do servidor"
          : message,
      code: "INTERNAL_ERROR",
    });
  });

  app.decorate("config", { env });
  app.decorate("redis", isRedisEnabled(env) ? getRedis(env) : null);
  app.decorate("evolution", new EvolutionService(env, app.log));

  app.addHook("onSend", async (_request, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    reply.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
      reply.header(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }
  });

  const origins = new Set<string>([
    env.APP_URL,
    "http://localhost:3002",
    "http://localhost:3003",
  ]);
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  }

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (origins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS não permitido"), false);
    },
    credentials: true,
  });
  await app.register(cookie);

  await app.register(webhookRoutes);
  await app.register(authRoutes);
  await app.register(meRoutes);
  await app.register(adminRoutes);

  app.get("/health", async (_request, reply) => {
    const { prisma } = await import("@motoboy/db");
    const { isAsaasConfigured } = await import("./lib/asaas-client.js");
    const { isAdminTableReady, isUserPasswordColumnReady } = await import(
      "./services/admin-auth-store.js"
    );
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      app.log.error(err);
      return reply.status(503).send({
        ok: false,
        database: "error",
        error: "Não conectou ao Supabase. Confira DATABASE_URL.",
      });
    }
    const adminTable = await isAdminTableReady();
    const userPasswordColumn = await isUserPasswordColumnReady();
    const migrationsHint = !adminTable
      ? "Rode pnpm db:deploy ou redeploy Vercel com DATABASE_URL em Build"
      : !userPasswordColumn
        ? "Rode a migration User.passwordHash no Supabase (20260527210000_user_password_hash)"
        : null;
    return {
      ok: true,
      database: "connected",
      adminTable,
      userPasswordColumn,
      migrationsHint,
      redis: isRedisEnabled(env),
      asaas: {
        configured: isAsaasConfigured(env),
        sandbox: Boolean(env.ASAAS_SANDBOX),
        webhook: "/api/backend/webhooks/asaas",
      },
    };
  });

  return app;
}
