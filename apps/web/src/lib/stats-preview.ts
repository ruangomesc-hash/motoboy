import { isExpenseEntry, type PeriodStats, type TodaySummary } from "@motoboy/types";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { todayDateInputValue } from "@/lib/local-date";

function periodStart(period: "week" | "month", now = new Date()): Date {
  const start = new Date(now);
  if (period === "week") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setMonth(start.getMonth() - 1);
  }
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isInStatsPeriod(
  iso: string,
  period: "week" | "month",
  now = new Date(),
): boolean {
  const at = new Date(iso);
  return at >= periodStart(period, now) && at <= now;
}

/** Estimativa local instantânea — mesma regra da Home quando custos não foram salvos. */
export function buildPreviewPeriodStats(
  period: "week" | "month",
  deliveries: DeliveryListItem[],
  today: TodaySummary | null,
  previous: PeriodStats | null,
): PeriodStats {
  const now = new Date();
  const series = new Map<string, number>();
  const seenIds = new Set<string>();
  let totalGross = 0;
  let totalKm = 0;
  let count = 0;

  for (const d of deliveries) {
    if (!isInStatsPeriod(d.occurredAt, period, now)) continue;
    if (seenIds.has(d.id)) continue;
    seenIds.add(d.id);

    const gross = Number(d.grossValue);
    const km = d.distanceKm != null ? Number(d.distanceKm) : 0;
    const key = d.occurredAt.slice(0, 10);
    series.set(key, (series.get(key) ?? 0) + gross);
    if (isExpenseEntry(gross)) continue;
    totalGross += gross;
    totalKm += Number.isFinite(km) ? km : 0;
    count += 1;
  }

  const todayKey = todayDateInputValue();
  if (today && isInStatsPeriod(new Date().toISOString(), period, now)) {
    const listedTodayGross = series.get(todayKey) ?? 0;
    if (today.grossTotal > listedTodayGross) {
      totalGross += today.grossTotal - listedTodayGross;
      series.set(todayKey, today.grossTotal);
    }
  }

  const costsConfigured = today?.costsConfigured ?? false;
  let totalNet = totalGross;
  if (costsConfigured && previous?.period === period && previous.totalGross > 0) {
    const ratio = totalGross / previous.totalGross;
    totalNet = previous.totalNet * ratio;
  } else if (costsConfigured && today) {
    totalNet = today.netProfit;
  }

  return {
    period,
    series: Array.from(series.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, gross]) => ({ date, gross })),
    totalGross,
    totalNet,
    count,
    totalKm,
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

  return {
    ...stats,
    totalGross: Math.max(0, stats.totalGross + delta.gross),
    totalNet: Math.max(0, stats.totalNet + netDelta),
    totalKm: Math.max(0, stats.totalKm + delta.km),
    count: Math.max(0, stats.count + delta.count),
  };
}
