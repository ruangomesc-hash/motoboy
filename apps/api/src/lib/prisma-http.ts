import { isPrismaTableMissingError, MIGRATIONS_REQUIRED_MESSAGE } from "./prisma-errors.js";

export type PrismaHttpErrorBody = {
  error: string;
  code?: string;
};

export function mapPrismaHttpError(err: unknown): {
  status: number;
  body: PrismaHttpErrorBody;
} | null {
  const code = (err as { code?: string }).code;
  const name = (err as { name?: string }).name;
  const message = err instanceof Error ? err.message : String(err);

  if (isPrismaTableMissingError(err)) {
    return {
      status: 503,
      body: {
        error: MIGRATIONS_REQUIRED_MESSAGE,
        code: "MIGRATIONS_REQUIRED",
      },
    };
  }

  if (code === "P2025") {
    return {
      status: 404,
      body: { error: "Registro não encontrado", code: "NOT_FOUND" },
    };
  }

  if (code === "P2003" || code === "P2014") {
    return {
      status: 409,
      body: {
        error:
          "Não foi possível concluir a operação por vínculos no banco de dados.",
        code: "FK_CONFLICT",
      },
    };
  }

  if (
    name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server") ||
    message.includes("Connection")
  ) {
    return {
      status: 503,
      body: {
        error:
          "Banco indisponível. Verifique DATABASE_URL (Supabase) e tente novamente.",
        code: "DATABASE_UNAVAILABLE",
      },
    };
  }

  if (code === "P2021") {
    return {
      status: 503,
      body: {
        error: MIGRATIONS_REQUIRED_MESSAGE,
        code: "MIGRATIONS_REQUIRED",
      },
    };
  }

  if (code?.startsWith("P10") || code?.startsWith("P20")) {
    return {
      status: 503,
      body: {
        error: "Falha temporária no banco. Tente novamente em instantes.",
        code: "DATABASE_ERROR",
      },
    };
  }

  if (
    err instanceof Error &&
    /transaction|interactive transactions|pgbouncer/i.test(err.message)
  ) {
    return {
      status: 503,
      body: {
        error: "Falha temporária no banco. Tente novamente em instantes.",
        code: "DATABASE_ERROR",
      },
    };
  }

  return null;
}

export function sendPrismaOrServiceError(
  reply: { status: (code: number) => { send: (body: unknown) => unknown } },
  err: unknown,
  fallbackMessage: string,
): unknown {
  const withStatus = err as Error & { statusCode?: number; code?: string };
  if (withStatus.statusCode) {
    return reply.status(withStatus.statusCode).send({
      error: withStatus.message,
      code: withStatus.code,
    });
  }
  const mapped = mapPrismaHttpError(err);
  if (mapped) {
    return reply.status(mapped.status).send(mapped.body);
  }
  return reply.status(500).send({
    error: fallbackMessage,
    code: "INTERNAL_ERROR",
  });
}
