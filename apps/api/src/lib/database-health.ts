import { prisma } from "@motoboy/db";

export type DatabaseHealthHint =
  | "env_missing"
  | "transient"
  | "credentials"
  | "unknown";

export type DatabaseHealth = {
  connected: boolean;
  hint?: DatabaseHealthHint;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function classifyDatabaseError(err: unknown): DatabaseHealthHint {
  const message =
    (err instanceof Error ? err.message : String(err ?? "")) ?? "";
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code ?? "")
      : "";

  if (
    /password authentication failed|invalid password|Tenant or user not found/i.test(
      message,
    )
  ) {
    return "credentials";
  }

  if (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1017" ||
    /Can't reach database|ECONNREFUSED|ECONNRESET|ETIMEDOUT|timeout|Connection terminated|server closed the connection/i.test(
      message,
    )
  ) {
    return "transient";
  }

  return "unknown";
}

export async function getDatabaseHealth(
  options: { retries?: number } = {},
): Promise<DatabaseHealth> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { connected: false, hint: "env_missing" };
  }

  const retries = options.retries ?? 3;
  let lastHint: DatabaseHealthHint = "unknown";

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { connected: true };
    } catch (err) {
      lastHint = classifyDatabaseError(err);
      if (attempt < retries - 1 && lastHint === "transient") {
        await sleep(350 * (attempt + 1));
        continue;
      }
      return { connected: false, hint: lastHint };
    }
  }

  return { connected: false, hint: lastHint };
}

export async function isDatabaseConnected(): Promise<boolean> {
  return (await getDatabaseHealth()).connected;
}
