/** Despesa manual = registro na tabela Delivery com valor negativo. */
export function isExpenseEntry(grossValue: number | string): boolean {
  return Number(grossValue) < 0;
}

export type DeliveryEntryRow = {
  grossValue: number | string;
  distanceKm?: number | string | null;
};

export function splitDeliveryEntries(rows: DeliveryEntryRow[]): {
  grossTotal: number;
  manualExpenses: number;
  deliveryCount: number;
  totalKm: number;
} {
  let grossTotal = 0;
  let manualExpenses = 0;
  let deliveryCount = 0;
  let totalKm = 0;

  for (const d of rows) {
    const gross = Number(d.grossValue);
    if (!Number.isFinite(gross)) continue;
    const km = d.distanceKm != null ? Number(d.distanceKm) : 0;

    if (isExpenseEntry(gross)) {
      manualExpenses += Math.abs(gross);
      continue;
    }

    grossTotal += gross;
    deliveryCount += 1;
    if (Number.isFinite(km)) totalKm += km;
  }

  return { grossTotal, manualExpenses, deliveryCount, totalKm };
}
