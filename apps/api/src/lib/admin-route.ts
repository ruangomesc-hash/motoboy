import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError, type ZodSchema } from "zod";
import { sendPrismaOrServiceError } from "./prisma-http.js";

export function assertAdminOnRequest(
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  const user = request.user;
  if (!user || user.role !== "admin") {
    void reply.status(401).send({ error: "Não autenticado" });
    return false;
  }
  return true;
}

export async function runAdminMutation<T>(
  request: FastifyRequest,
  reply: FastifyReply,
  fallbackMessage: string,
  fn: () => Promise<T>,
): Promise<T | unknown> {
  if (!assertAdminOnRequest(request, reply)) {
    return reply;
  }
  try {
    return await fn();
  } catch (err) {
    if (reply.sent) {
      request.log.error(
        { err },
        "admin mutation failed after response was already sent",
      );
      return reply;
    }
    if (err instanceof ZodError) {
      const first = err.errors[0]?.message ?? "Dados inválidos";
      return reply.status(400).send({ error: first, code: "VALIDATION_ERROR" });
    }
    return sendPrismaOrServiceError(reply, err, fallbackMessage);
  }
}

export function parseAdminBody<T>(
  schema: ZodSchema<T>,
  body: unknown,
): T {
  return schema.parse(body);
}
