import type {
  IntegrationHealthRow,
  IntegrationsHealthReport,
} from "@motoboy/types";

export type { IntegrationHealthRow, IntegrationsHealthReport };

export function integrationStatusLabel(
  status: IntegrationHealthRow["status"],
): string {
  const map: Record<IntegrationHealthRow["status"], string> = {
    ok: "Operacional",
    degraded: "Atenção",
    rate_limited: "Limite de tokens",
    error: "Erro",
    not_configured: "Não configurada",
  };
  return map[status];
}

export function integrationStatusTone(
  status: IntegrationHealthRow["status"],
): "success" | "warning" | "danger" | "default" {
  if (status === "ok") return "success";
  if (status === "degraded") return "warning";
  if (status === "rate_limited" || status === "error") return "danger";
  return "default";
}

export function formatTokenBudget(row: IntegrationHealthRow): string | null {
  const rl = row.rateLimit;
  if (!rl?.limitTokens || rl.remainingTokens == null) return null;
  return `${rl.remainingTokens.toLocaleString("pt-BR")} / ${rl.limitTokens.toLocaleString("pt-BR")} tokens (janela)`;
}

export function tokenBudgetPercent(row: IntegrationHealthRow): number | null {
  const rl = row.rateLimit;
  if (!rl?.limitTokens || rl.remainingTokens == null) return null;
  return Math.min(100, (rl.remainingTokens / rl.limitTokens) * 100);
}
