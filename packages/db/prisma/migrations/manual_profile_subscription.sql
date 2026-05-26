-- Aplique se `pnpm db:push` não rodar. Ex.: psql -d motocheck -f manual_profile_subscription.sql

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "subscriptionPaymentMethod" TEXT NOT NULL DEFAULT 'PIX';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "workDays" JSONB NOT NULL DEFAULT '[1, 2, 3, 4, 5, 6]';

ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentMethods";
