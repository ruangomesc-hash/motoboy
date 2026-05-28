import type { TodaySummary } from "@motoboy/types";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { isIsoOnDateInput, todayDateInputValue } from "@/lib/local-date";
import { dedupeRecentDeliveries } from "@/lib/merge-app-data";

/** Lista única para Home — mesma fonte que Entregas. */
export function buildRecentDeliveriesForHome(
  deliveries: DeliveryListItem[],
  tombstoneIds: ReadonlySet<string>,
  todayKey = todayDateInputValue(),
): TodaySummary["recentDeliveries"] {
  return dedupeRecentDeliveries(
    deliveries
      .filter(
        (d) =>
          !tombstoneIds.has(d.id) && isIsoOnDateInput(d.occurredAt, todayKey),
      )
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
