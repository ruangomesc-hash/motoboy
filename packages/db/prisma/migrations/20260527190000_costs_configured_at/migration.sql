-- Só descontar custos diários/estimados após salvar em Configurações
ALTER TABLE "CostConfig" ADD COLUMN IF NOT EXISTS "costsConfiguredAt" TIMESTAMP(3);
