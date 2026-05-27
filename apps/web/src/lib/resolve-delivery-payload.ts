import type { TodaySummary } from "@motoboy/types";
import type { CreatedDelivery } from "@/lib/app-data-cache";
import type { DeliveryListItem } from "@/lib/app-persist-cache";

function fromListItem(row: DeliveryListItem): CreatedDelivery {
  return {
    id: row.id,
    grossValue: row.grossValue,
    source: row.source,
    originName: row.originName,
    occurredAt: row.occurredAt,
    distanceKm: row.distanceKm ?? null,
  };
}

export function recentDeliveryToPayload(
  row: TodaySummary["recentDeliveries"][number],
): CreatedDelivery {
  return {
    id: row.id,
    grossValue: row.grossValue,
    source: row.source,
    originName: row.originName,
    occurredAt: row.occurredAt,
    distanceKm: null,
  };
}

/** Dados da entrega para atualizar Home, lista e estatísticas ao apagar. */
export function resolveDeliveryPayload(
  deliveryId: string,
  sources: {
    deliveries: DeliveryListItem[];
    today: TodaySummary | null;
    fallback?: CreatedDelivery;
  },
): CreatedDelivery | undefined {
  if (sources.fallback?.id === deliveryId) return sources.fallback;

  const inList = sources.deliveries.find((d) => d.id === deliveryId);
  if (inList) return fromListItem(inList);

  const inRecent = sources.today?.recentDeliveries.find(
    (d) => d.id === deliveryId,
  );
  if (inRecent) return recentDeliveryToPayload(inRecent);

  return undefined;
}
