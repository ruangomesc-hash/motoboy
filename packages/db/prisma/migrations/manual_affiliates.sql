-- Afiliados e indicações (rode com pnpm db:push ou manualmente)

CREATE TABLE IF NOT EXISTS "Affiliate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "phone" TEXT,
  "email" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_code_key" ON "Affiliate"("code");
CREATE INDEX IF NOT EXISTS "Affiliate_code_idx" ON "Affiliate"("code");
CREATE INDEX IF NOT EXISTS "Affiliate_active_idx" ON "Affiliate"("active");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredByAffiliateId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "affiliateCouponCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_referredByAffiliateId_idx" ON "User"("referredByAffiliateId");

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_referredByAffiliateId_fkey"
    FOREIGN KEY ("referredByAffiliateId") REFERENCES "Affiliate"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
