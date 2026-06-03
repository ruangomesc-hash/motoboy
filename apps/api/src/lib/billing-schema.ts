import { prisma } from "@motoboy/db";

export type BillingSchemaReady = {
  userCpfCnpj: boolean;
  paymentChargeKind: boolean;
};

export const BILLING_MIGRATIONS_MESSAGE =
  "Banco desatualizado para pagamentos. Rode `pnpm db:deploy` (migrations cpfCnpj e chargeKind no Supabase) e faça redeploy na Vercel.";

let cached: BillingSchemaReady | null = null;

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

export async function assertBillingSchemaReady(): Promise<void> {
  const ready = await getBillingSchemaReady();
  if (!billingSchemaOk(ready)) {
    const missing: string[] = [];
    if (!ready.userCpfCnpj) missing.push("User.cpfCnpj");
    if (!ready.paymentChargeKind) missing.push("Payment.chargeKind");
    throw Object.assign(
      new Error(`${BILLING_MIGRATIONS_MESSAGE} Falta: ${missing.join(", ")}.`),
      { statusCode: 503, code: "BILLING_MIGRATIONS_REQUIRED" },
    );
  }
}

/** Só para testes. */
export function resetBillingSchemaCache(): void {
  cached = null;
}
