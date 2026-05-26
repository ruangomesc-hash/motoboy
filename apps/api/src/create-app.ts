import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
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

  app.setErrorHandler((error: unknown, _request, reply) => {
    const err = error as { code?: string; name?: string; message?: string };
    if (err.code?.startsWith("P20")) {
      app.log.error(error);
      return reply.status(503).send({
        error:
          "Banco indisponível. Verifique DATABASE_URL (Supabase) e rode as migrations.",
      });
    }
    if (err.name === "ZodError") {
      return reply.status(400).send({ error: "Dados inválidos" });
    }
    app.log.error(error);
    return reply.status(500).send({
      error:
        process.env.NODE_ENV === "production"
          ? "Erro interno do servidor"
          : (err.message ?? "Erro interno do servidor"),
    });
  });

  app.decorate("config", { env });
  app.decorate("redis", isRedisEnabled(env) ? getRedis(env) : null);
  app.decorate("evolution", new EvolutionService(env, app.log));

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
    origin: [...origins],
    credentials: true,
  });
  await app.register(cookie);

  await app.register(webhookRoutes);
  await app.register(authRoutes);
  await app.register(meRoutes);
  await app.register(adminRoutes);

  app.get("/health", async () => {
    const { prisma } = await import("@motoboy/db");
    const { isAsaasConfigured } = await import("./lib/asaas-client.js");
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      database: "connected",
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
