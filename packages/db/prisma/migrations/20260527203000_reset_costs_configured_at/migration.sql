-- Reset inicial: evita descontos automáticos em contas legadas.
-- Custos voltam a ser aplicados apenas após salvar em Configurações.
UPDATE "CostConfig"
SET "costsConfiguredAt" = NULL;
