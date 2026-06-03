CREATE TABLE IF NOT EXISTS "WhatsAppUnknownSender" (
    "phone" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReplyAt" TIMESTAMP(3),
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppUnknownSender_pkey" PRIMARY KEY ("phone")
);

CREATE INDEX IF NOT EXISTS "WhatsAppUnknownSender_blocked_lastMessageAt_idx" ON "WhatsAppUnknownSender"("blocked", "lastMessageAt");
