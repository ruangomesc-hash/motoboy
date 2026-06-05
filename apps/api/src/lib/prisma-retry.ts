import { prisma } from "@motoboy/db";

const TRANSIENT_PRISMA_CODES = new Set([
  "P1001",
  "P1002",
  "P1017",
  "P2024",
  "P2034",
  "P2037",
]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isTransientPrismaError(err: unknown): boolean {
  const code = (err as { code?: string }).code;
  if (code && TRANSIENT_PRISMA_CODES.has(code)) return true;
  const message = err instanceof Error ? err.message : String(err);
  return /connection|pool|timeout|closed the connection|can't reach database/i.test(
    message,
  );
}

/** Reabre o pool após esperas longas (ex.: poll do QR Pix no Asaas). */
export async function ensurePrismaConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    try {
      await prisma.$disconnect();
    } catch {
      /* ignore */
    }
    await prisma.$connect();
  }
}

export async function withPrismaRetry<T>(
  fn: () => Promise<T>,
  opts?: { maxAttempts?: number; baseDelayMs?: number },
): Promise<T> {
  const maxAttempts = opts?.maxAttempts ?? 3;
  const baseDelayMs = opts?.baseDelayMs ?? 250;
  let last: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        await ensurePrismaConnection();
      }
      return await fn();
    } catch (err) {
      last = err;
      if (!isTransientPrismaError(err) || attempt >= maxAttempts - 1) {
        throw err;
      }
      await sleep(baseDelayMs * (attempt + 1));
    }
  }

  throw last;
}
