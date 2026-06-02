import {
  isExpenseEntry,
  resolvePeriodRange,
  isIsoInPeriodRange,
  splitDeliveryEntries,
  type DeliverySource,
  type PeriodStats,
} from "@motoboy/types";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import type { ExcludedDailyCostRegistry } from "@/lib/excluded-daily-cost-tombstones";

const SOURCE_ORDER: DeliverySource[] = [
  "IFOOD",
  "NINETY_NINE",
  "RAPPI",
  "PARTICULAR",
  "OTHER",
];

export function filterDeliveriesInPeriod(
  deliveries: DeliveryListItem[],
  period: "week" | "month",
  anchorDate: string,
  tombstoneIds: ReadonlySet<string> = new Set(),
): DeliveryListItem[] {
  const range = resolvePeriodRange(period, anchorDate);
  return deliveries.filter(
    (d) =>
      !tombstoneIds.has(d.id) && isIsoInPeriodRange(d.occurredAt, range),
  );
}

/** Métricas de receita/km/contagem derivadas da lista de entregas (fonte única com Home/Entregas). */
export function computePeriodDeliveryMetrics(
  deliveries: DeliveryListItem[],
  period: "week" | "month",
  anchorDate: string,
  tombstoneIds: ReadonlySet<string> = new Set(),
): Pick<
  PeriodStats,
  | "totalGross"
  | "count"
  | "totalKm"
  | "bySource"
  | "series"
  | "periodStart"
  | "periodEnd"
  | "anchorDate"
  | "period"
> & {
  manualExpenseItems: { label: string; amount: number }[];
  manualExpensesTotal: number;
} {
  const range = resolvePeriodRange(period, anchorDate);
  const inRange = filterDeliveriesInPeriod(
    deliveries,
    period,
    anchorDate,
    tombstoneIds,
  );

  const split = splitDeliveryEntries(
    inRange.map((d) => ({
      id: d.id,
      grossValue: Number(d.grossValue),
      distanceKm: d.distanceKm,
      originName: d.originName,
    })),
  );

  const seriesMap = new Map<string, number>();
  const bySource = new Map<
    DeliverySource,
    { gross: number; count: number; km: number }
  >();

  for (const d of inRange) {
    const gross = Number(d.grossValue);
    if (!Number.isFinite(gross) || isExpenseEntry(gross)) continue;
    const key = d.occurredAt.slice(0, 10);
    seriesMap.set(key, (seriesMap.get(key) ?? 0) + gross);
    const km = d.distanceKm != null ? Number(d.distanceKm) : 0;
    const source = d.source as DeliverySource;
    const row = bySource.get(source) ?? { gross: 0, count: 0, km: 0 };
    row.gross += gross;
    row.count += 1;
    row.km += Number.isFinite(km) ? km : 0;
    bySource.set(source, row);
  }

  const manualMap = new Map<string, number>();
  for (const item of split.manualExpenseItems) {
    manualMap.set(item.label, (manualMap.get(item.label) ?? 0) + item.amount);
  }

  return {
    period,
    anchorDate: range.anchorDate,
    periodStart: range.periodStart,
    periodEnd: range.periodEnd,
    totalGross: split.grossTotal,
    count: split.deliveryCount,
    totalKm: split.totalKm,
    bySource: SOURCE_ORDER.filter((s) => bySource.has(s)).map((source) => ({
      source,
      ...bySource.get(source)!,
    })),
    series: Array.from(seriesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, gross]) => ({ date, gross })),
    manualExpenseItems: Array.from(manualMap.entries()).map(
      ([label, amount]) => ({ label, amount }),
    ),
    manualExpensesTotal: split.manualExpenses,
  };
}

/** Mescla métricas ao vivo (entregas) com custos configurados da API. */
export function mergeLivePeriodStats(
  api: PeriodStats | null,
  deliveries: DeliveryListItem[],
  period: "week" | "month",
  anchorDate: string,
  tombstoneIds: ReadonlySet<string> = new Set(),
  excludedDailyCosts?: ExcludedDailyCostRegistry | null,
): PeriodStats {
  const live = computePeriodDeliveryMetrics(
    deliveries,
    period,
    anchorDate,
    tombstoneIds,
  );

  const manualRows = live.manualExpenseItems.map((item) => ({
    key: `manual:${item.label}`,
    label: item.label,
    amount: item.amount,
  }));

  if (!api) {
    const totalExpenses = live.manualExpensesTotal;
    const base = {
      ...live,
      totalNet: live.totalGross - totalExpenses,
      totalExpenses,
      expenses: manualRows.sort((a, b) => b.amount - a.amount),
      hoursWorked: 0,
      grossPerHour: null,
      netPerHour: null,
      activeShift: null,
    };
    return excludedDailyCosts
      ? excludedDailyCosts.adjustPeriodStats(base, period, anchorDate)
      : base;
  }

  const apiAdjusted = excludedDailyCosts
    ? excludedDailyCosts.adjustPeriodStats(api, period, anchorDate)
    : api;

  const configExpenses = (apiAdjusted.expenses ?? []).filter(
    (e) => !e.key.startsWith("manual:"),
  );
  const configTotal = configExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = configTotal + live.manualExpensesTotal;
  const totalNet = live.totalGross - totalExpenses;
  const expenses = [...configExpenses, ...manualRows].sort(
    (a, b) => b.amount - a.amount,
  );

  return {
    ...apiAdjusted,
    ...live,
    totalNet,
    totalExpenses,
    expenses,
  };
}
