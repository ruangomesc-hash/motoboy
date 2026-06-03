const DELIVERY_SOURCE_LABELS: Record<string, string> = {
  IFOOD: "iFood",
  NINETY_NINE: "99",
  RAPPI: "Rappi",
  PARTICULAR: "Particular",
  OTHER: "Outro",
};

export function formatDeliverySourceLabel(source: string): string {
  return DELIVERY_SOURCE_LABELS[source] ?? source;
}

/** Lista do app e confirmação Zap: "Particular - Farmácia" quando há local. */
export function formatDeliveryRecordLabel(
  source: string,
  originName?: string | null,
): string {
  const app = formatDeliverySourceLabel(source);
  const local = originName?.trim();
  if (local) return `${app} - ${local}`;
  return app;
}
