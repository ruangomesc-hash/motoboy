import type { TodaySummary } from "@motoboy/types";

export type CreatedDelivery = {
  id: string;
  grossValue: number | string;
  source: string;
  originName?: string | null;
  occurredAt?: string;
  distanceKm?: number | string | null;
};

/** Atualiza o resumo do dia na hora (antes do refetch da API). */
export function applyDeliveryToToday(
  today: TodaySummary,
  delivery: CreatedDelivery,
): TodaySummary {
  const gross = Number(delivery.grossValue);
  const km = delivery.distanceKm != null ? Number(delivery.distanceKm) : 0;
  const newRecent = {
    id: delivery.id,
    grossValue: gross,
    originName: delivery.originName ?? null,
    source: delivery.source as TodaySummary["recentDeliveries"][0]["source"],
    occurredAt: delivery.occurredAt ?? new Date().toISOString(),
  };

  return {
    ...today,
    grossTotal: today.grossTotal + gross,
    totalKm: today.totalKm + (Number.isFinite(km) ? km : 0),
    deliveryCount: today.deliveryCount + 1,
    recentDeliveries: [newRecent, ...today.recentDeliveries].slice(0, 3),
  };
}
