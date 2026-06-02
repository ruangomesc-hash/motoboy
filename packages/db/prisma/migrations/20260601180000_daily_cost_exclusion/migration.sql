-- CreateTable
CREATE TABLE "DailyCostExclusion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "costKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCostExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCostExclusion_userId_dateKey_costKey_key" ON "DailyCostExclusion"("userId", "dateKey", "costKey");

-- CreateIndex
CREATE INDEX "DailyCostExclusion_userId_dateKey_idx" ON "DailyCostExclusion"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "DailyCostExclusion" ADD CONSTRAINT "DailyCostExclusion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
