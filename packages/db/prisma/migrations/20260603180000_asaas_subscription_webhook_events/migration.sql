ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "asaasSubscriptionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_asaasSubscriptionId_key" ON "User"("asaasSubscriptionId");

CREATE TABLE IF NOT EXISTS "AsaasWebhookEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AsaasWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AsaasWebhookEvent_processedAt_idx" ON "AsaasWebhookEvent"("processedAt");
