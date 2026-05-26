-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('PROFILE', 'COSTS', 'GOAL', 'DELIVERY', 'FUEL', 'ODOMETER', 'SHIFT');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "DeliverySource" AS ENUM ('IFOOD', 'NINETY_NINE', 'RAPPI', 'PARTICULAR', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "vehiclePlate" TEXT,
    "city" TEXT,
    "workApps" JSONB NOT NULL DEFAULT '[]',
    "subscriptionPaymentMethod" TEXT NOT NULL DEFAULT 'PIX',
    "workDays" JSONB NOT NULL DEFAULT '[1, 2, 3, 4, 5, 6]',
    "status" "UserStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "subscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentOdometerKm" DECIMAL(10,1),
    "referredByAffiliateId" TEXT,
    "affiliateCouponCode" TEXT,
    "referredAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliate" (
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

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "title" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '[]',
    "entityId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'app',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fuelPricePerLiter" DECIMAL(10,2) NOT NULL DEFAULT 6.00,
    "kmPerLiter" DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    "maintenancePerKm" DECIMAL(10,4) NOT NULL DEFAULT 0.15,
    "dailyFoodCost" DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    "otherDailyCost" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "DeliverySource" NOT NULL,
    "grossValue" DECIMAL(10,2) NOT NULL,
    "distanceKm" DECIMAL(10,2),
    "durationMin" INTEGER,
    "originName" TEXT,
    "destinationAddr" TEXT,
    "destinationLat" DOUBLE PRECISION,
    "destinationLng" DOUBLE PRECISION,
    "proofPhotoUrl" TEXT,
    "proofLat" DOUBLE PRECISION,
    "proofLng" DOUBLE PRECISION,
    "proofAt" TIMESTAMP(3),
    "rawInput" JSONB NOT NULL,
    "parsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "startKm" DECIMAL(10,2),
    "endKm" DECIMAL(10,2),

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "GoalPeriod" NOT NULL,
    "targetValue" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addresses" JSONB NOT NULL,
    "optimizedOrder" JSONB NOT NULL,
    "totalKm" DECIMAL(10,2) NOT NULL,
    "totalMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asaasChargeId" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fromNumber" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "rawContent" JSONB NOT NULL,
    "processedAs" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelRefuel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "liters" DECIMAL(10,3) NOT NULL,
    "pricePerLiter" DECIMAL(10,3) NOT NULL,
    "receiptPhotoUrl" TEXT,
    "rawInput" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelRefuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OdometerReading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "odometerKm" DECIMAL(10,1) NOT NULL,
    "photoUrl" TEXT,
    "rawInput" JSONB NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OdometerReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthCode" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_whatsappNumber_key" ON "User"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_whatsappNumber_idx" ON "User"("whatsappNumber");

-- CreateIndex
CREATE INDEX "User_referredByAffiliateId_idx" ON "User"("referredByAffiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_code_key" ON "Affiliate"("code");

-- CreateIndex
CREATE INDEX "Affiliate_code_idx" ON "Affiliate"("code");

-- CreateIndex
CREATE INDEX "Affiliate_active_idx" ON "Affiliate"("active");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CostConfig_userId_key" ON "CostConfig"("userId");

-- CreateIndex
CREATE INDEX "Delivery_userId_occurredAt_idx" ON "Delivery"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "Shift_userId_startedAt_idx" ON "Shift"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "Goal_userId_period_active_idx" ON "Goal"("userId", "period", "active");

-- CreateIndex
CREATE INDEX "Route_userId_createdAt_idx" ON "Route"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_asaasChargeId_key" ON "Payment"("asaasChargeId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_fromNumber_receivedAt_idx" ON "WhatsAppMessage"("fromNumber", "receivedAt");

-- CreateIndex
CREATE INDEX "FuelRefuel_userId_occurredAt_idx" ON "FuelRefuel"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "OdometerReading_userId_recordedAt_idx" ON "OdometerReading"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "AuthCode_phone_expiresAt_idx" ON "AuthCode"("phone", "expiresAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredByAffiliateId_fkey" FOREIGN KEY ("referredByAffiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostConfig" ADD CONSTRAINT "CostConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelRefuel" ADD CONSTRAINT "FuelRefuel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OdometerReading" ADD CONSTRAINT "OdometerReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
