ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "asaasCustomerId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_asaasCustomerId_key" ON "User"("asaasCustomerId");
