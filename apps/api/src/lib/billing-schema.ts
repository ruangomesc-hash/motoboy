import {
  deriveDirectDatabaseUrl,
  prisma,
  PrismaClient,
} from "@motoboy/db";

export type BillingSchemaReady = {
  userCpfCnpj: boolean;
  paymentChargeKind: boolean;
};

export const BILLING_MIGRATIONS_MESSAGE =
  "Banco desatualizado para pagamentos. Configure DIRECT_URL na Vercel (Supabase porta 5432), rode `pnpm db:deploy` ou execute manual_billing_checkout.sql no Supabase.";

let cached: BillingSchemaReady | null = null;
let directPrisma: PrismaClient | null = null;

async function columnExists(
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

export async function getBillingSchemaReady(
  opts?: { refresh?: boolean },
): Promise<BillingSchemaReady> {
  if (!opts?.refresh && cached) return cached;
  const [userCpfCnpj, paymentChargeKind] = await Promise.all([
    columnExists("User", "cpfCnpj"),
    columnExists("Payment", "chargeKind"),
  ]);
  cached = { userCpfCnpj, paymentChargeKind };
  return cached;
}

export function billingSchemaOk(ready: BillingSchemaReady): boolean {
  return ready.userCpfCnpj && ready.paymentChargeKind;
}

function resolveDirectUrl(): string | undefined {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) return direct;
  const pooled = process.env.DATABASE_URL?.trim();
  if (!pooled) return undefined;
  return deriveDirectDatabaseUrl(pooled);
}

function getDirectPrisma(): PrismaClient {
  if (directPrisma) return directPrisma;
  const direct = resolveDirectUrl();
  if (!direct) return prisma;
  directPrisma = new PrismaClient({
    datasources: { db: { url: direct } },
    log: ["error"],
  });
  return directPrisma;
}

const BILLING_DDL_STATEMENTS = [
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cpfCnpj" TEXT`,
  `DO $$ BEGIN
    CREATE TYPE "PaymentChargeKind" AS ENUM ('SUBSCRIPTION', 'SUPPORT');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$`,
  `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "chargeKind" "PaymentChargeKind" NOT NULL DEFAULT 'SUBSCRIPTION'`,
  `CREATE INDEX IF NOT EXISTS "Payment_userId_chargeKind_status_idx" ON "Payment"("userId", "chargeKind", "status")`,
];

function isDdlBlockedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /prepared statement|42P05|cannot execute .* in a read-only|ddl|permission denied/i.test(
    msg,
  );
}

/**
 * Garante colunas do checkout Pix/cartão. Usa DIRECT_URL quando existir (DDL no Supabase).
 */
export async function ensureBillingSchemaColumns(): Promise<void> {
  const before = await getBillingSchemaReady({ refresh: true });
  if (billingSchemaOk(before)) return;

  const db = getDirectPrisma();
  try {
    for (const sql of BILLING_DDL_STATEMENTS) {
      await db.$executeRawUnsafe(sql);
    }
  } catch (err) {
    if (isDdlBlockedError(err)) {
      throw Object.assign(
        new Error(
          `${BILLING_MIGRATIONS_MESSAGE} (DDL bloqueada no pooler — use DIRECT_URL.)`,
        ),
        { statusCode: 503, code: "BILLING_MIGRATIONS_REQUIRED" },
      );
    }
    throw err;
  }

  resetBillingSchemaCache();
  const after = await getBillingSchemaReady({ refresh: true });
  if (!billingSchemaOk(after)) {
    const missing: string[] = [];
    if (!after.userCpfCnpj) missing.push("User.cpfCnpj");
    if (!after.paymentChargeKind) missing.push("Payment.chargeKind");
    throw Object.assign(
      new Error(`${BILLING_MIGRATIONS_MESSAGE} Falta: ${missing.join(", ")}.`),
      { statusCode: 503, code: "BILLING_MIGRATIONS_REQUIRED" },
    );
  }
}

/** @deprecated Use ensureBillingSchemaColumns */
export async function assertBillingSchemaReady(): Promise<void> {
  return ensureBillingSchemaColumns();
}

/** Só para testes. */
export function resetBillingSchemaCache(): void {
  cached = null;
}

export async function disconnectBillingDirectPrisma(): Promise<void> {
  if (directPrisma) {
    await directPrisma.$disconnect();
    directPrisma = null;
  }
}
