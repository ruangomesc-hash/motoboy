import {
  isExpenseEntry,
  resolvePeriodRange,
  isIsoInPeriodRange,
  type DeliverySource,
  type PeriodStats,
  type TodaySummary,
} from "@motoboy/types";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { todayDateInputValue } from "@/lib/local-date";

const EMPTY_PERIOD_STATS = (
  period: "week" | "month",
  anchorDate: string,
): PeriodStats => ({
  period,
  anchorDate,
  periodStart: anchorDate,
  periodEnd: anchorDate,
  series: [],
  totalGross: 0,
  totalNet: 0,
  totalExpenses: 0,
  count: 0,
  totalKm: 0,
  bySource: [],
  expenses: [],
  hoursWorked: 0,
  grossPerHour: null,
  netPerHour: null,
  activeShift: null,
});

/** Garante campos novos quando stats vem do cache antigo ou API parcial. */
export function normalizePeriodStats(
  stats: PeriodStats | null | undefined,
  period: "week" | "month",
  anchorDate = todayDateInputValue(),
): PeriodStats | null {
  if (!stats) return null;
  const base = EMPTY_PERIOD_STATS(period, anchorDate);
  const totalExpenses =
    stats.totalExpenses ??
    Math.max(0, (stats.totalGross ?? 0) - (stats.totalNet ?? 0));
  return {
    ...base,
    ...stats,
    period: stats.period ?? period,
    anchorDate: stats.anchorDate ?? anchorDate,
    periodStart: stats.periodStart ?? base.periodStart,
    periodEnd: stats.periodEnd ?? base.periodEnd,
    bySource: Array.isArray(stats.bySource) ? stats.bySource : [],
    expenses: Array.isArray(stats.expenses) ? stats.expenses : [],
    totalExpenses,
    series: Array.isArray(stats.series) ? stats.series : [],
  };
}

const SOURCE_ORDER: DeliverySource[] = [
  "IFOOD",
  "NINETY_NINE",
  "RAPPI",
  "PARTICULAR",
  "OTHER",
];

/** Estimativa local instantânea — complementa a API enquanto carrega ou após mutação otimista. */
export function buildPreviewPeriodStats(
  period: "week" | "month",
  deliveries: DeliveryListItem[],
  today: TodaySummary | null,
  previous: PeriodStats | null,
  anchorDate: string,
): PeriodStats {
  const range = resolvePeriodRange(period, anchorDate);
  const series = new Map<string, number>();
  const bySource = new Map<
    DeliverySource,
    { gross: number; count: number; km: number }
  >();
  const manualExpenseMap = new Map<string, number>();
  const seenIds = new Set<string>();
  let totalGross = 0;
  let totalKm = 0;
  let count = 0;
  let manualTotal = 0;

  for (const d of deliveries) {
    if (!isIsoInPeriodRange(d.occurredAt, range)) continue;
    if (seenIds.has(d.id)) continue;
    seenIds.add(d.id);

    const gross = Number(d.grossValue);
    const km = d.distanceKm != null ? Number(d.distanceKm) : 0;
    const key = d.occurredAt.slice(0, 10);
    series.set(key, (series.get(key) ?? 0) + gross);

    if (isExpenseEntry(gross)) {
      const amount = Math.abs(gross);
      manualTotal += amount;
      const label = d.originName?.trim() || "Despesa";
      manualExpenseMap.set(label, (manualExpenseMap.get(label) ?? 0) + amount);
      continue;
    }

    totalGross += gross;
    totalKm += Number.isFinite(km) ? km : 0;
    count += 1;

    const source = d.source as DeliverySource;
    const row = bySource.get(source) ?? { gross: 0, count: 0, km: 0 };
    row.gross += gross;
    row.count += 1;
    row.km += km;
    bySource.set(source, row);
  }

  const todayKey = todayDateInputValue();
  if (
    today &&
    isIsoInPeriodRange(new Date().toISOString(), range) &&
    isIsoInPeriodRange(`${todayKey}T12:00:00.000Z`, range)
  ) {
    const listedTodayGross = series.get(todayKey) ?? 0;
    if (today.grossTotal > listedTodayGross) {
      totalGross += today.grossTotal - listedTodayGross;
      series.set(todayKey, today.grossTotal);
    }
  }

  const todayInPeriod = Boolean(
    today &&
      isIsoInPeriodRange(new Date().toISOString(), range) &&
      isIsoInPeriodRange(`${todayKey}T12:00:00.000Z`, range),
  );
  const todayAutoExpenses = today
    ? today.fuelCost + today.maintenanceCost + today.otherCost
    : 0;

  let totalNet = totalGross;
  let totalExpenses = 0;
  const expenses: PeriodStats["expenses"] = [];

  if (
    previous?.period === period &&
    previous.anchorDate === anchorDate
  ) {
    totalNet = previous.totalNet;
    totalExpenses = previous.totalExpenses ?? 0;
    if (previous.expenses?.length) {
      expenses.push(...previous.expenses);
    }
  } else if (todayInPeriod && today && todayAutoExpenses > 0) {
    totalExpenses = todayAutoExpenses;
    totalNet = totalGross - todayAutoExpenses;
    if (today.fuelCost > 0) {
      expenses.push({ key: "fuel", label: "Combustível", amount: today.fuelCost });
    }
  }

  for (const [label, amount] of manualExpenseMap.entries()) {
    expenses.push({ key: `manual:${label}`, label, amount });
    if (!previous?.expenses?.length) {
      totalExpenses += amount;
      totalNet -= amount;
    }
  }
  expenses.sort((a, b) => b.amount - a.amount);

  const bySourceRows = SOURCE_ORDER.filter((s) => bySource.has(s)).map(
    (source) => ({
      source,
      ...bySource.get(source)!,
    }),
  );

  return {
    period,
    anchorDate: range.anchorDate,
    periodStart: range.periodStart,
    periodEnd: range.periodEnd,
    series: Array.from(series.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, gross]) => ({ date, gross })),
    totalGross,
    totalNet,
    totalExpenses,
    count,
    totalKm,
    bySource: bySourceRows,
    expenses,
    hoursWorked: previous?.hoursWorked ?? 0,
    grossPerHour: previous?.grossPerHour ?? null,
    netPerHour: previous?.netPerHour ?? null,
    activeShift: previous?.activeShift ?? null,
  };
}

export function patchPeriodStatsDelivery(
  stats: PeriodStats,
  delta: { gross: number; km: number; count: number },
): PeriodStats {
  const hasExpenses = stats.totalGross > stats.totalNet;
  const netDelta =
    hasExpenses && stats.totalGross > 0
      ? (delta.gross / stats.totalGross) * stats.totalNet
      : delta.gross;

  const nextGross = Math.max(0, stats.totalGross + delta.gross);
  const nextNet = Math.max(0, stats.totalNet + netDelta);

  return {
    ...stats,
    totalGross: nextGross,
    totalNet: nextNet,
    totalExpenses: Math.max(0, nextGross - nextNet),
    totalKm: Math.max(0, stats.totalKm + delta.km),
    count: Math.max(0, stats.count + delta.count),
  };
}

/** @deprecated use isIsoInPeriodRange from @motoboy/types */
export function isInStatsPeriod(
  iso: string,
  period: "week" | "month",
  anchorDate = todayDateInputValue(),
): boolean {
  const range = resolvePeriodRange(period, anchorDate);
  return isIsoInPeriodRange(iso, range);
}
