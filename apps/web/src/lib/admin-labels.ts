export const DELINQUENCY_LABEL: Record<string, string> = {
  trial_expired: "Trial vencido",
  payment_pending: "Cobrança pendente",
  payment_failed: "Pagamento falhou",
};

export function formatAppUsage(
  months: number,
  remainderDays: number,
  totalDays: number,
): string {
  const parts: string[] = [];
  if (months > 0) {
    parts.push(months === 1 ? "1 mês" : `${months} meses`);
  }
  if (remainderDays > 0 || months === 0) {
    parts.push(remainderDays === 1 ? "1 dia" : `${remainderDays} dias`);
  }
  if (parts.length === 0) return "Hoje";
  return `${parts.join(" e ")} (${totalDays}d total)`;
}

export const LOG_CATEGORY_LABEL: Record<string, string> = {
  ALL: "Todas",
  PROFILE: "Perfil",
  COSTS: "Custos",
  GOAL: "Metas",
  DELIVERY: "Entregas",
  FUEL: "Combustível",
  ODOMETER: "Odômetro",
  SHIFT: "Turno",
};
