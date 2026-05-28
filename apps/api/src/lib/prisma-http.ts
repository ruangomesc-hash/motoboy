import { isPrismaTableMissingError, MIGRATIONS_REQUIRED_MESSAGE } from "./prisma-errors.js";

export type PrismaHttpErrorBody = {
  error: string;
  code?: string;
};

export function mapPrismaHttpError(err: unknown): {
  status: number;
  body: PrismaHttpErrorBody;
} | null {
  const raw = err as { code?: string; name?: string; message?: string };
  const code = raw.code;
  const name = raw.name ?? (err instanceof Error ? err.name : undefined);
  const message =
    (err instanceof Error ? err.message : raw.message) ?? String(err);

  if (code === "P2022" && /passwordHash/i.test(message)) {
    return {
      status: 503,
      body: {
        error:
          "Banco sem coluna de senha do motoboy. Rode a migration passwordHash no Supabase.",
        code: "MIGRATIONS_REQUIRED",
      },
    };
  }

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

  if (code === "P2021" || code === "P2022") {
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
