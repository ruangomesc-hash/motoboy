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

  const costsConfigured = today?.costsConfigured ?? false;
  let totalNet = totalGross;
  let totalExpenses = 0;
  const expenses: PeriodStats["expenses"] = [];

  if (previous?.period === period && previous.anchorDate === anchorDate) {
    totalNet = previous.totalNet;
    totalExpenses = previous.totalExpenses;
    if (previous.expenses.length > 0) {
      expenses.push(...previous.expenses);
    }
  } else if (costsConfigured && today) {
    totalNet = today.netProfit;
    totalExpenses = Math.max(0, totalGross - totalNet);
    if (today.fuelCost > 0) {
      expenses.push({ key: "fuel", label: "Combustível", amount: today.fuelCost });
    }
    if (today.maintenanceCost > 0) {
      expenses.push({
        key: "maintenance",
        label: "Manutenção (km)",
        amount: today.maintenanceCost,
      });
    }
    if (today.otherCost > 0) {
      expenses.push({
        key: "other",
        label: "Alimentação e outros",
        amount: today.otherCost,
      });
    }
  } else if (costsConfigured && previous?.period === period) {
    const ratio =
      previous.totalGross > 0 ? totalGross / previous.totalGross : 1;
    totalNet = previous.totalNet * ratio;
    totalExpenses = Math.max(0, totalGross - totalNet);
  }

  for (const [label, amount] of manualExpenseMap.entries()) {
    expenses.push({ key: `manual:${label}`, label, amount });
    if (!previous?.expenses.length) {
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
  costsConfigured: boolean,
): PeriodStats {
  const netDelta = costsConfigured
    ? stats.totalGross > 0
      ? (delta.gross / stats.totalGross) * stats.totalNet
      : delta.gross
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
