import type { FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "@motoboy/types";
import type { JwtPayload } from "./auth.js";
import { verifyToken } from "./auth.js";

function readAdminToken(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  const cookie = (request.cookies as Record<string, string> | undefined)?.[
    "motoboy-admin-token"
  ];
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return cookie?.trim();
}

/** Autentica admin na rota; retorna null se já respondeu 401/403 (pare a rota com `return`). */
export async function authenticateAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<JwtPayload | null> {
  const env = (request.server as { config: { env: Env } }).config.env;
  const token = readAdminToken(request);

  if (!token) {
    await reply.status(401).send({ error: "Não autenticado" });
    return null;
  }

  try {
    const payload = verifyToken(token, env.JWT_SECRET);
    if (payload.role !== "admin") {
      await reply.status(403).send({ error: "Acesso negado" });
      return null;
    }
    request.user = payload;
    return payload;
  } catch {
    await reply.status(401).send({ error: "Token inválido" });
    return null;
  }
}
