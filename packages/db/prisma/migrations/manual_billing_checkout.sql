-- Checkout Pix/cartão (rode no Supabase SQL Editor se pnpm db:deploy não rodou na Vercel)

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cpfCnpj" TEXT;

DO $$ BEGIN
  CREATE TYPE "PaymentChargeKind" AS ENUM ('SUBSCRIPTION', 'SUPPORT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "chargeKind" "PaymentChargeKind" NOT NULL DEFAULT 'SUBSCRIPTION';

CREATE INDEX IF NOT EXISTS "Payment_userId_chargeKind_status_idx"
  ON "Payment"("userId", "chargeKind", "status");
