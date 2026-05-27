-- Só descontar custos diários/estimados após salvar em Configurações
ALTER TABLE "CostConfig" ADD COLUMN "costsConfiguredAt" TIMESTAMP(3);

-- Quem já salvou custos antes desta migration continua com descontos ativos
UPDATE "CostConfig"
SET "costsConfiguredAt" = "updatedAt"
WHERE
  "fuelPricePerLiter" <> 6.00
  OR "kmPerLiter" <> 35.00
  OR "maintenancePerKm" <> 0.15
  OR "dailyFoodCost" <> 25.00
  OR "otherDailyCost" <> 0.00;
