import type { FastifyInstance } from "fastify";
import { prisma } from "@motoboy/db";
import {
  registerRequestSchema,
  whatsappRequestSchema,
  whatsappVerifySchema,
} from "@motoboy/types";
import { normalizePhone } from "../lib/phone.js";
import { signToken } from "../lib/auth.js";
import { redisDel, redisGet, redisSetex } from "../lib/redis.js";
import { validateAffiliateCode } from "../services/affiliate.js";
import {
  isEvolutionConfigured,
  isSkipAuthCodeEnabled,
} from "../lib/auth-config.js";
import {
  createUserWithProfile,
  findUserByPhone,
} from "../services/user.js";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendAuthCode(
  app: FastifyInstance,
  phone: string,
  code: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await prisma.authCode.deleteMany({ where: { phone } });
  await prisma.authCode.create({ data: { phone, code, expiresAt } });
  await redisSetex(app.redis, `auth:${phone}`, 300, code);
  await app.evolution.sendText(
    phone,
    `Seu código Motocopiloto: ${code}`,
  );
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;

  app.get("/auth/config", async () => ({
    skipAuthCode: isSkipAuthCodeEnabled(env),
    evolutionConfigured: isEvolutionConfigured(env),
  }));

  app.get("/auth/affiliate/validate", async (request, reply) => {
    const q = request.query as { code?: string };
    if (!q.code?.trim()) {
      return reply.status(400).send({ error: "Informe o cupom" });
    }
    return validateAffiliateCode(q.code);
  });

  app.post("/auth/register/request", async (request, reply) => {
    const body = registerRequestSchema.parse(request.body);
    const phone = normalizePhone(body.phone);
    const email = body.email.trim().toLowerCase();

    if (isSkipAuthCodeEnabled(env)) {
      return reply.send({ ok: true, skipVerify: true });
    }

    const existingPhone = await findUserByPhone(phone);
    if (existingPhone) {
      return reply.status(409).send({
        error: "Este WhatsApp já tem conta. Use Entrar.",
      });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return reply.status(409).send({
        error: "Este e-mail já está em uso.",
      });
    }

    if (body.affiliateCode) {
      const affiliate = await validateAffiliateCode(body.affiliateCode);
      if (!affiliate.valid) {
        return reply.status(400).send({
          error: "Cupom de indicação inválido ou inativo.",
        });
      }
    }

    const code = generateCode();
    await sendAuthCode(app, phone, code);

    return reply.send({ ok: true });
  });

  app.post("/auth/whatsapp/request", async (request, reply) => {
    const body = whatsappRequestSchema.parse(request.body);
    const phone = normalizePhone(body.phone);

    if (isSkipAuthCodeEnabled(env)) {
      return reply.send({ ok: true, skipVerify: true });
    }

    const user = await findUserByPhone(phone);
    if (!user) {
      return reply.status(404).send({
        error: "Conta não encontrada. Crie seu cadastro primeiro.",
      });
    }

    const code = generateCode();
    await sendAuthCode(app, phone, code);

    return reply.send({ ok: true });
  });

  app.post("/auth/whatsapp/verify", async (request, reply) => {
    const body = whatsappVerifySchema.parse(request.body);
    const phone = normalizePhone(body.phone);
    const stored = await redisGet(app.redis, `auth:${phone}`);

    const record = await prisma.authCode.findFirst({
      where: { phone, code: body.code, expiresAt: { gt: new Date() } },
    });

    const bypassCode =
      isSkipAuthCodeEnabled(env) && body.code === "000000";

    const codeValid =
      bypassCode || record?.code === body.code || stored === body.code;

    if (!codeValid) {
      return reply.status(400).send({ error: "Código inválido ou expirado" });
    }

    let user = await findUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      if (!body.name?.trim() || !body.email?.trim()) {
        return reply.status(400).send({
          error: "Complete o cadastro com nome e e-mail.",
          code: "NEEDS_PROFILE",
        });
      }
      try {
        user = await createUserWithProfile({
          whatsappNumber: phone,
          name: body.name,
          email: body.email,
          affiliateCode: body.affiliateCode,
        });
        isNewUser = true;
      } catch (err) {
        const e = err as Error & { statusCode?: number };
        if (e.statusCode === 409) {
          return reply.status(409).send({ error: e.message });
        }
        throw err;
      }
    }

    const token = signToken(
      { userId: user.id, whatsappNumber: user.whatsappNumber },
      env.JWT_SECRET,
    );

    await redisDel(app.redis, `auth:${phone}`);
    await prisma.authCode.deleteMany({ where: { phone } });

    return reply
      .setCookie("motoboy-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      })
      .send({ ok: true, token, userId: user.id, isNewUser });
  });
}
