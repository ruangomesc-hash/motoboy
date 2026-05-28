import type { TodaySummary } from "@motoboy/types";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { isIsoOnDateInput, todayDateInputValue } from "@/lib/local-date";
import { dedupeRecentDeliveries } from "@/lib/merge-app-data";

function deliveriesForToday(
  deliveries: DeliveryListItem[],
  todayKey: string,
  tombstoneIds: ReadonlySet<string>,
): DeliveryListItem[] {
  return deliveries.filter(
    (d) =>
      !tombstoneIds.has(d.id) && isIsoOnDateInput(d.occurredAt, todayKey),
  );
}

/** Totais do dia sempre derivados da lista de entregas (evita R$ 125 na Home e R$ 150 na lista). */
export function recomputeTodayFromDeliveries(
  deliveries: DeliveryListItem[],
  today: TodaySummary,
  todayKey = todayDateInputValue(),
  tombstoneIds: ReadonlySet<string> = new Set(),
): TodaySummary {
  const todays = deliveriesForToday(deliveries, todayKey, tombstoneIds);
  let grossTotal = 0;
  let totalKm = 0;
  for (const d of todays) {
    grossTotal += Number(d.grossValue);
    const km = d.distanceKm != null ? Number(d.distanceKm) : 0;
    if (Number.isFinite(km)) totalKm += km;
  }
  const deliveryCount = todays.length;
  const totalExpenses = today.costsConfigured
    ? today.totalExpenses
    : today.fuel.isActual
      ? today.fuelCost
      : 0;
  const netProfit = grossTotal - totalExpenses;

  const recentDeliveries = dedupeRecentDeliveries(
    [...todays]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      .slice(0, 3)
      .map((d) => ({
        id: d.id,
        grossValue: Number(d.grossValue),
        originName: d.originName,
        source: d.source as TodaySummary["recentDeliveries"][0]["source"],
        occurredAt: d.occurredAt,
      })),
  );

  return {
    ...today,
    grossTotal,
    totalKm,
    deliveryCount,
    totalExpenses,
    netProfit,
    profitPerKm: totalKm > 0 ? netProfit / totalKm : 0,
    recentDeliveries,
  };
}

/** Lista única para Home — mesma fonte que Entregas. */
export function buildRecentDeliveriesForHome(
  deliveries: DeliveryListItem[],
  tombstoneIds: ReadonlySet<string> = new Set(),
  todayKey = todayDateInputValue(),
): TodaySummary["recentDeliveries"] {
  const todays = deliveriesForToday(deliveries, todayKey, tombstoneIds);
  return dedupeRecentDeliveries(
    [...todays]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      .slice(0, 3)
      .map((d) => ({
        id: d.id,
        grossValue: Number(d.grossValue),
        originName: d.originName,
        source: d.source as TodaySummary["recentDeliveries"][0]["source"],
        occurredAt: d.occurredAt,
      })),
  );
}
