import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import type { Env } from "@motoboy/types";
import {
  hasAppAccess,
  isBillingRoute,
  loadSessionUser,
  type SessionUser,
} from "./session-user.js";

export interface JwtPayload {
  userId: string;
  whatsappNumber?: string;
  role?: "admin" | "user";
}

export function signToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function signAdminToken(secret: string): string {
  return jwt.sign(
    { userId: "admin", role: "admin" as const },
    secret,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = (request.server as { config: { env: Env } }).config.env;
  const header = request.headers.authorization;
  const cookie = (request.cookies as Record<string, string> | undefined)?.[
    "motoboy-token"
  ];
  const token =
    header?.startsWith("Bearer ") ? header.slice(7) : cookie;

  if (!token) {
    await reply.status(401).send({ error: "Não autenticado" });
    return;
  }

  try {
    const payload = verifyToken(token, env.JWT_SECRET);
    if (payload.role === "admin") {
      await reply.status(401).send({ error: "Use login de motoboy" });
      return;
    }
    if (!payload.userId) {
      await reply.status(401).send({ error: "Sessão inválida" });
      return;
    }
    request.user = payload;
  } catch {
    await reply.status(401).send({ error: "Token inválido" });
  }
}

/** Carrega o usuário do banco e garante que o token pertence a uma conta real. */
export async function requireSessionUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.user?.userId;
  if (!userId) {
    await reply.status(401).send({ error: "Não autenticado" });
    return;
  }

  const sessionUser = await loadSessionUser(userId);
  if (!sessionUser) {
    await reply.status(401).send({
      error: "Conta não encontrada. Faça login novamente.",
      code: "USER_NOT_FOUND",
    });
    return;
  }

  if (sessionUser.status === "CANCELED") {
    await reply.status(403).send({
      error: "Conta cancelada. Entre em contato com o suporte.",
      code: "ACCOUNT_CANCELED",
    });
    return;
  }

  request.sessionUser = sessionUser;
}

/** Bloqueia uso do app se trial expirou e não há assinatura ativa. */
export async function requireAppAccess(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const sessionUser = request.sessionUser;
  if (!sessionUser) {
    await reply.status(401).send({ error: "Não autenticado" });
    return;
  }

  const path = request.url.split("?")[0] ?? request.url;
  if (isBillingRoute(request.method, path)) {
    return;
  }

  if (!hasAppAccess(sessionUser)) {
    await reply.status(402).send({
      error: "Trial encerrado. Assine o Motocopiloto para continuar.",
      code: "SUBSCRIPTION_REQUIRED",
      trialEndsAt: sessionUser.trialEndsAt?.toISOString() ?? null,
    });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = (request.server as { config: { env: Env } }).config.env;
  const header = request.headers.authorization;
  const cookie = (request.cookies as Record<string, string> | undefined)?.[
    "motoboy-admin-token"
  ];
  const token =
    header?.startsWith("Bearer ") ? header.slice(7) : cookie;

  if (!token) {
    await reply.status(401).send({ error: "Não autenticado" });
    return;
  }

  try {
    const payload = verifyToken(token, env.JWT_SECRET);
    if (payload.role !== "admin") {
      await reply.status(403).send({ error: "Acesso negado" });
      return;
    }
    request.user = payload;
  } catch {
    await reply.status(401).send({ error: "Token inválido" });
  }
}

function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "").trim();
}

export function getAdminCredentials(_env: Env): {
  email: string;
  password: string;
} | null {
  const isProd =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  const emailRaw = process.env.ADMIN_EMAIL?.trim() ?? "";
  const password = normalizeEnvSecret(process.env.ADMIN_PASSWORD);

  if (isProd) {
    if (!emailRaw || !password) return null;
    return { email: emailRaw.toLowerCase(), password };
  }

  const email = (emailRaw || "admin@motocopiloto.com.br").toLowerCase();
  const pass = password ?? "admin123456";
  return { email, password: pass };
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
    sessionUser?: SessionUser;
  }
}
