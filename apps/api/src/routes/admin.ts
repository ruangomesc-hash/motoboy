import type { FastifyInstance } from "fastify";
import {
  adminCreateAffiliateSchema,
  adminCreateUserSchema,
  adminLoginSchema,
} from "@motoboy/types";
import {
  getAdminCredentials,
  requireAdmin,
  signAdminToken,
} from "../lib/auth.js";
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

  app.post("/admin/auth/login", async (request, reply) => {
    const body = adminLoginSchema.parse(request.body);
    const creds = getAdminCredentials(env);
    if (!creds) {
      return reply.status(503).send({
        error:
          "Painel admin não configurado. Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env",
      });
    }
    const email = body.email.trim().toLowerCase();
    if (email !== creds.email || body.password !== creds.password) {
      return reply.status(401).send({ error: "E-mail ou senha incorretos" });
    }

    const token = signAdminToken(env.JWT_SECRET);
    reply.setCookie("motoboy-admin-token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return { token };
  });

  app.addHook("preHandler", async (request, reply) => {
    if (
      request.method === "POST" &&
      request.url.split("?")[0] === "/admin/auth/login"
    ) {
      return;
    }
    await requireAdmin(request, reply);
  });

  app.get("/admin/overview", async () => getAdminOverview());

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
