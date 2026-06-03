-- Diferencia cobrança de assinatura vs avulsa (admin/suporte)
CREATE TYPE "PaymentChargeKind" AS ENUM ('SUBSCRIPTION', 'SUPPORT');

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "chargeKind" "PaymentChargeKind" NOT NULL DEFAULT 'SUBSCRIPTION';
