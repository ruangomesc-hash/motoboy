-- Remove custos estimados/fallback; lucro usa só abastecimento real e despesas manuais.
UPDATE "CostConfig"
SET
  "fuelPricePerLiter" = 0,
  "kmPerLiter" = 0,
  "maintenancePerKm" = 0,
  "dailyFoodCost" = 0,
  "otherDailyCost" = 0,
  "costsConfiguredAt" = NULL;
