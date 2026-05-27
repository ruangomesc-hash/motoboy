-- Só descontar custos diários/estimados após salvar em Configurações
ALTER TABLE "CostConfig" ADD COLUMN "costsConfiguredAt" TIMESTAMP(3);

-- Quem já salvou custos antes desta migration continua com descontos ativos
UPDATE "CostConfig"
SET "costsConfiguredAt" = "updatedAt"
WHERE "updatedAt" > "createdAt";
