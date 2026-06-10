import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import type { Env } from "@motoboy/types";
import {
  hasAppAccess,
  isBillingRoute,
  loadSessionUser,
  type SessionUser,
} from "./session-user.js";
import { recordClientErrorSafe } from "../services/client-error-log.js";

export interface JwtPayload {
  userId: string;
  whatsappNumber?: string;
  role?: "admin" | "user";
}

const JWT_ALG = "HS256" as const;

function normalizeJwtSecret(secret: string): string {
  return secret.replace(/^["']|["']$/g, "").trim();
}

export function signToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, normalizeJwtSecret(secret), {
    expiresIn: "30d",
    algorithm: JWT_ALG,
  });
}

export function signAdminToken(secret: string): string {
  return jwt.sign(
    { userId: "admin", role: "admin" as const },
    normalizeJwtSecret(secret),
    { expiresIn: "7d", algorithm: JWT_ALG },
  );
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, normalizeJwtSecret(secret), {
    algorithms: [JWT_ALG],
  }) as JwtPayload;
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
    void recordClientErrorSafe({
      errorCode: "NOT_AUTHENTICATED",
      rawMessage: "Não autenticado",
      httpStatus: 401,
      route: request.url.split("?")[0],
      method: request.method,
      source: "api",
    });
    return reply.status(401).send({ error: "Não autenticado", code: "NOT_AUTHENTICATED" });
  }

  try {
    const payload = verifyToken(token, env.JWT_SECRET);
    if (payload.role === "admin") {
      void recordClientErrorSafe({
        errorCode: "ADMIN_TOKEN_ON_APP",
        rawMessage: "Use login de motoboy",
        httpStatus: 401,
        route: request.url.split("?")[0],
        method: request.method,
        source: "api",
      });
      return reply.status(401).send({
        error: "Use login de motoboy",
        code: "ADMIN_TOKEN_ON_APP",
      });
    }
    if (!payload.userId) {
      void recordClientErrorSafe({
        errorCode: "SESSION_INVALID",
        rawMessage: "Sessão inválida",
        httpStatus: 401,
        route: request.url.split("?")[0],
        method: request.method,
        source: "api",
      });
      return reply.status(401).send({ error: "Sessão inválida", code: "SESSION_INVALID" });
    }
    request.user = payload;
  } catch (err) {
    let userId: string | undefined;
    try {
      const decoded = jwt.decode(token) as { userId?: string } | null;
      userId = decoded?.userId;
    } catch {
      userId = undefined;
    }
    const isExpired =
      err instanceof jwt.TokenExpiredError ||
      (err instanceof Error && err.message.toLowerCase().includes("expired"));
    const code = isExpired ? "JWT_EXPIRED" : "JWT_INVALID";
    void recordClientErrorSafe({
      userId,
      errorCode: code,
      rawMessage: err instanceof Error ? err.message : "Token inválido",
      httpStatus: 401,
      route: request.url.split("?")[0],
      method: request.method,
      source: "api",
    });
    return reply.status(401).send({
      error: isExpired ? "Sessão expirada. Faça login novamente." : "Token inválido",
      code,
    });
  }
}

/** Carrega o usuário do banco e garante que o token pertence a uma conta real. */
export async function requireSessionUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send({ error: "Não autenticado" });
  }

  let sessionUser: SessionUser | null;
  try {
    sessionUser = await loadSessionUser(userId);
  } catch (err) {
    request.log.error({ err, userId }, "Falha ao carregar sessão do usuário");
    return reply.status(503).send({
      error:
        "Banco indisponível. Verifique DATABASE_URL (Supabase) e tente novamente.",
      code: "DATABASE_UNAVAILABLE",
    });
  }

  if (!sessionUser) {
    void recordClientErrorSafe({
      userId,
      errorCode: "USER_NOT_FOUND",
      rawMessage: "Conta não encontrada. Faça login novamente.",
      httpStatus: 401,
      route: request.url.split("?")[0],
      method: request.method,
      source: "api",
    });
    return reply.status(401).send({
      error: "Conta não encontrada. Faça login novamente.",
      code: "USER_NOT_FOUND",
    });
  }

  const path = request.url.split("?")[0] ?? request.url;
  if (
    sessionUser.status === "CANCELED" &&
    !isBillingRoute(request.method, path)
  ) {
    void recordClientErrorSafe({
      userId,
      errorCode: "ACCOUNT_CANCELED",
      rawMessage: "Conta cancelada. Entre em contato com o suporte.",
      httpStatus: 403,
      route: path,
      method: request.method,
      source: "api",
    });
    return reply.status(403).send({
      error: "Conta cancelada. Entre em contato com o suporte.",
      code: "ACCOUNT_CANCELED",
    });
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
    return reply.status(401).send({ error: "Não autenticado" });
  }

  const path = request.url.split("?")[0] ?? request.url;
  if (isBillingRoute(request.method, path) || path === "/me/client-errors") {
    return;
  }

  if (!hasAppAccess(sessionUser)) {
    void recordClientErrorSafe({
      userId: sessionUser.id,
      errorCode: "SUBSCRIPTION_REQUIRED",
      rawMessage: "Trial encerrado. Assine o Motocopiloto para continuar.",
      httpStatus: 402,
      route: path,
      method: request.method,
      source: "api",
    });
    return reply.status(402).send({
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
  const { authenticateAdmin } = await import("./admin-auth.js");
  await authenticateAdmin(request, reply);
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
