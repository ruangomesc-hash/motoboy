import type { FastifyInstance } from "fastify";
import {
  adminCreateAffiliateSchema,
  adminCreateUserSchema,
  adminLoginSchema,
} from "@motoboy/types";
import { requireAdmin, signAdminToken } from "../lib/auth.js";
import {
  envAdminCredentialsConfigured,
  isAdminConfigured,
  isAdminTableReady,
  isDatabaseConnected,
  setupAdminAccount,
  verifyAdminLoginWithEnvFallback,
} from "../services/admin-auth-store.js";
import { MIGRATIONS_REQUIRED_MESSAGE } from "../lib/prisma-errors.js";
import {
  activateAdminUser,
  createAdminPaymentLink,
} from "../services/admin-billing.js";
import {
  createAdminAffiliate,
  getAdminAffiliateReferrals,
  getAdminAffiliatesRanking,
} from "../services/affiliate.js";
import {
  createAdminUser,
  getAdminDelinquentList,
  getAdminOverview,
  getAdminUsageLogs,
  getAdminUsersList,
} from "../services/admin-metrics.js";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;

  app.get("/admin/auth/status", async (_request, reply) => {
    const [databaseConnected, migrationsReady] = await Promise.all([
      isDatabaseConnected(),
      isAdminTableReady(),
    ]);
    const configured = migrationsReady ? await isAdminConfigured() : false;
    return reply.send({
      configured,
      migrationsReady,
      databaseConnected,
      envLoginAvailable: envAdminCredentialsConfigured(),
      bootstrapEmail: process.env.ADMIN_EMAIL?.trim() ?? null,
    });
  });

  app.post("/admin/auth/setup", async (request, reply) => {
    const body = adminLoginSchema.parse(request.body);
    try {
      const { email } = await setupAdminAccount(
        body.email,
        body.password.trim(),
      );
      const token = signAdminToken(env.JWT_SECRET);
      reply.setCookie("motoboy-admin-token", token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return reply.send({ ok: true, token, email });
    } catch (err) {
      const e = err as Error & { statusCode?: number; code?: string };
      return reply.status(e.statusCode ?? 400).send({
        error: e.message,
        code: e.code,
      });
    }
  });

  app.post("/admin/auth/login", async (request, reply) => {
    const body = adminLoginSchema.parse(request.body);
    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();
    const envLogin = envAdminCredentialsConfigured();

    const migrationsReady = await isAdminTableReady();
    const configured = migrationsReady ? await isAdminConfigured() : false;

    if (!migrationsReady && !envLogin) {
      return reply.status(503).send({
        error: MIGRATIONS_REQUIRED_MESSAGE,
        code: "MIGRATIONS_REQUIRED",
      });
    }

    if (!configured && migrationsReady && !envLogin) {
      return reply.status(400).send({
        error:
          "Primeiro acesso: use Continuar sem senha e defina sua senha de administrador.",
        code: "NEEDS_SETUP",
      });
    }

    if (!(await verifyAdminLoginWithEnvFallback(email, password))) {
      return reply.status(401).send({ error: "E-mail ou senha incorretos" });
    }
    const token = signAdminToken(env.JWT_SECRET);
    reply.setCookie("motoboy-admin-token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return reply.send({ token });
  });

  app.addHook("preHandler", async (request, reply) => {
    const path = request.url.split("?")[0];
    if (
      path === "/admin/auth/login" ||
      path === "/admin/auth/setup" ||
      path === "/admin/auth/status"
    ) {
      return;
    }
    await requireAdmin(request, reply);
  });

  app.get("/admin/overview", async (_request, reply) => {
    try {
      return await getAdminOverview();
    } catch (err) {
      const connected = await isDatabaseConnected();
      if (!connected) {
        return reply.status(503).send({
          error:
            "Não conectou ao Supabase. Confira DATABASE_URL e DIRECT_URL na Vercel.",
          code: "DATABASE_UNAVAILABLE",
        });
      }
      throw err;
    }
  });

  app.get("/admin/users", async (request) => {
    const q = request.query as { page?: string; limit?: string; status?: string };
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(50, Math.max(10, Number(q.limit ?? 20)));
    return getAdminUsersList(page, limit, q.status);
  });

  app.post("/admin/users", async (request, reply) => {
    const body = adminCreateUserSchema.parse(request.body);
    try {
      const user = await createAdminUser(body);
      return reply.status(201).send(user);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      if (e.statusCode === 409) {
        return reply.status(409).send({ error: e.message });
      }
      throw err;
    }
  });

  app.get("/admin/delinquent", async (request) => {
    const q = request.query as { page?: string; limit?: string };
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(50, Math.max(10, Number(q.limit ?? 20)));
    return getAdminDelinquentList(page, limit);
  });

  app.post("/admin/users/:userId/payment-link", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      return await createAdminPaymentLink(userId, env);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      if (e.statusCode) {
        return reply.status(e.statusCode).send({ error: e.message });
      }
      throw err;
    }
  });

  app.post("/admin/users/:userId/activate", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      return await activateAdminUser(userId);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      if (e.statusCode) {
        return reply.status(e.statusCode).send({ error: e.message });
      }
      throw err;
    }
  });

  app.get("/admin/affiliates", async () => getAdminAffiliatesRanking());

  app.post("/admin/affiliates", async (request, reply) => {
    const body = adminCreateAffiliateSchema.parse(request.body);
    try {
      const affiliate = await createAdminAffiliate(body);
      const ranking = await getAdminAffiliatesRanking();
      const ranked = ranking.items.find((a) => a.id === affiliate.id);
      return reply.status(201).send(ranked ?? affiliate);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      if (e.statusCode === 409) {
        return reply.status(409).send({ error: e.message });
      }
      throw err;
    }
  });

  app.get("/admin/affiliates/:affiliateId/referrals", async (request, reply) => {
    const { affiliateId } = request.params as { affiliateId: string };
    try {
      return await getAdminAffiliateReferrals(affiliateId);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      if (e.statusCode === 404) {
        return reply.status(404).send({ error: e.message });
      }
      throw err;
    }
  });

  app.get("/admin/logs", async (request) => {
    const q = request.query as { page?: string; limit?: string; category?: string };
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(100, Math.max(10, Number(q.limit ?? 30)));
    return getAdminUsageLogs(page, limit, q.category);
  });
}
