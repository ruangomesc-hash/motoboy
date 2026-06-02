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
import { collectCorsOrigins, isCorsOriginAllowed } from "./lib/cors-origins.js";
import { mapPrismaHttpError } from "./lib/prisma-http.js";
import { recordClientErrorSafe } from "./services/client-error-log.js";
import { isProductionRuntime } from "./lib/runtime-env.js";

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

  app.addHook("onRequest", async (request) => {
    const { normalizeWhatsAppWebhookPath } = await import(
      "./lib/whatsapp-webhook-routes.js"
    );
    const normalized = normalizeWhatsAppWebhookPath(request.url);
    if (normalized !== request.url) {
      request.raw.url = normalized;
    }
  });

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
    if (err.message === "CORS não permitido") {
      return reply.status(403).send({
        error:
          "Origem do navegador não autorizada. Confira APP_URL e NEXTAUTH_URL na Vercel.",
        code: "CORS_FORBIDDEN",
      });
    }
    app.log.error(error);
    const path = request.url.split("?")[0] ?? "";
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    const userId = request.user?.userId ?? request.sessionUser?.id;
    if (path.startsWith("/me") && !path.startsWith("/admin")) {
      void recordClientErrorSafe({
        userId,
        errorCode: "INTERNAL_ERROR",
        rawMessage: message.slice(0, 2000),
        httpStatus: 500,
        route: path,
        method: request.method,
        source: "api",
      });
    }
    const isAdminMutation =
      (path === "/admin/users" && request.method === "POST") ||
      (path.includes("/admin/users/") &&
        (request.method === "DELETE" || request.method === "PUT"));
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

  // Na Vercel a API só é chamada via /api/backend no mesmo domínio; CORS estrito quebra POST/PUT.
  const relaxCors =
    process.env.VERCEL === "1" || process.env.CORS_RELAXED === "true";
  const allowedOrigins = collectCorsOrigins(env);

  await app.register(cors, {
    origin: relaxCors
      ? true
      : (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }
          if (isCorsOriginAllowed(origin, allowedOrigins)) {
            callback(null, true);
            return;
          }
          app.log.warn({ origin, allowed: [...allowedOrigins] }, "CORS blocked");
          callback(new Error("CORS não permitido"), false);
        },
    credentials: true,
  });
  await app.register(cookie);

  await app.register(webhookRoutes);
  await app.register(authRoutes);
  await app.register(meRoutes);
  await app.register(adminRoutes);

  if (isProductionRuntime() && env.EVOLUTION_API_URL?.trim()) {
    void import("./services/whatsapp-diagnostics.js")
      .then(async ({ repairEvolutionWebhook }) => {
        app.log.info("Sincronizando webhook Evolution (URL + apikey Vercel)");
        await repairEvolutionWebhook(env);
      })
      .catch((err) => {
        app.log.warn({ err }, "Sync webhook Evolution falhou");
      });
  }

  /** Liveness — Railway healthcheck (sem DB). */
  app.get("/health/live", async () => ({ ok: true }));

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
    const { getWhatsAppQueueCounts } = await import("./lib/whatsapp-queue.js");
    const whatsappQueue = await getWhatsAppQueueCounts(env);
    const runWhatsAppWorker =
      process.env.RUN_WHATSAPP_WORKER === "true" && isRedisEnabled(env);
    const whatsappProcessing = runWhatsAppWorker ? "queue" : "inline";
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
      whatsappWorker: runWhatsAppWorker,
      whatsappProcessing,
      whatsappQueue,
      asaas: {
        configured: isAsaasConfigured(env),
        sandbox: Boolean(env.ASAAS_SANDBOX),
        webhook: "/api/backend/webhooks/asaas",
      },
    };
  });

  /** Diagnóstico público do pipeline Zap (sem PII — use /admin/whatsapp/pipeline para detalhe). */
  app.get("/health/whatsapp", async (_request, reply) => {
    const { getWhatsAppPipelineDiagnostics } = await import(
      "./services/whatsapp-diagnostics.js"
    );
    try {
      const d = await getWhatsAppPipelineDiagnostics(env);
      const critical = d.issues.filter((i) => i.severity === "critical");
      return reply.status(critical.length === 0 ? 200 : 503).send({
        ok: critical.length === 0,
        checkedAt: d.checkedAt,
        processing: d.processing,
        evolution: {
          connectionState: d.evolution.connectionState,
          instance: d.evolution.instance,
        },
        webhook: {
          expectedUrl: d.expectedWebhookUrl,
          configuredUrl: d.webhook.configuredUrl,
          urlMatches: d.webhook.urlMatches,
          enabled: d.webhook.enabled,
          hasApikeyHeader: d.webhook.hasApikeyHeader,
        },
        database: {
          messagesLast24h: d.database.messagesLast24h,
          messagesLast48h: d.database.messagesLast48h,
          webhookHitsLast24h: d.database.webhookHitsLast24h,
        },
        webhookByEvents: d.webhook.webhookByEvents,
        recentInbound: d.database.recentMessages
          .filter((m) => m.messageType === "webhook")
          .slice(0, 8)
          .map((m) => ({
            at: m.receivedAt,
            status: m.processedAs,
            phoneTail: m.fromNumber.slice(-4),
          })),
        issues: d.issues.map((i) => ({
          severity: i.severity,
          code: i.code,
          message: i.message,
          action: i.action,
        })),
      });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({
        ok: false,
        error: "Falha ao diagnosticar pipeline WhatsApp",
      });
    }
  });

  return app;
}
