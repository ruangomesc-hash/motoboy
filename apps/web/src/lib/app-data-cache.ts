import type { TodaySummary } from "@motoboy/types";

export type CreatedDelivery = {
  id: string;
  grossValue: number | string;
  source: string;
  originName?: string | null;
  occurredAt?: string;
  distanceKm?: number | string | null;
};

/** Extrai entrega criada da resposta POST /me/deliveries (sem cast em genérico). */
export function extractCreatedDelivery(
  result: unknown,
  path: string,
  method: string,
): CreatedDelivery | undefined {
  if (
    method !== "POST" ||
    !path.includes("/deliveries") ||
    !result ||
    typeof result !== "object"
  ) {
    return undefined;
  }
  const row = result as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.source !== "string") {
    return undefined;
  }
  if (
    typeof row.grossValue !== "number" &&
    typeof row.grossValue !== "string"
  ) {
    return undefined;
  }
  return {
    id: row.id,
    grossValue: row.grossValue,
    source: row.source,
    originName:
      typeof row.originName === "string" || row.originName === null
        ? row.originName
        : null,
    occurredAt:
      typeof row.occurredAt === "string"
        ? row.occurredAt
        : row.occurredAt instanceof Date
          ? row.occurredAt.toISOString()
          : undefined,
    distanceKm:
      typeof row.distanceKm === "number" ||
      typeof row.distanceKm === "string" ||
      row.distanceKm === null
        ? row.distanceKm
        : null,
  };
}

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

  const grossTotal = today.grossTotal + gross;
  const totalKm = today.totalKm + (Number.isFinite(km) ? km : 0);
  const totalExpenses = today.costsConfigured
    ? today.totalExpenses
    : today.fuel.isActual
      ? today.fuelCost
      : 0;

  return {
    ...today,
    grossTotal,
    totalKm,
    deliveryCount: today.deliveryCount + 1,
    totalExpenses,
    netProfit: grossTotal - totalExpenses,
    profitPerKm: totalKm > 0 ? (grossTotal - totalExpenses) / totalKm : 0,
    recentDeliveries: [newRecent, ...today.recentDeliveries].slice(0, 3),
  };
}

/** Reverte entrega no resumo do dia (exclusão). */
export function removeDeliveryFromToday(
  today: TodaySummary,
  delivery: CreatedDelivery,
): TodaySummary {
  const gross = Number(delivery.grossValue);
  const km = delivery.distanceKm != null ? Number(delivery.distanceKm) : 0;
  const grossTotal = Math.max(0, today.grossTotal - gross);
  const totalKm = Math.max(0, today.totalKm - (Number.isFinite(km) ? km : 0));
  const deliveryCount = Math.max(0, today.deliveryCount - 1);
  const totalExpenses = today.costsConfigured
    ? today.totalExpenses
    : today.fuel.isActual
      ? today.fuelCost
      : 0;

  return {
    ...today,
    grossTotal,
    totalKm,
    deliveryCount,
    totalExpenses,
    netProfit: grossTotal - totalExpenses,
    profitPerKm: totalKm > 0 ? (grossTotal - totalExpenses) / totalKm : 0,
    recentDeliveries: today.recentDeliveries.filter((d) => d.id !== delivery.id),
  };
}
