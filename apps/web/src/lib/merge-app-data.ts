import type { TodaySummary } from "@motoboy/types";
import { applyDeliveryToToday } from "@/lib/app-data-cache";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { isIsoOnDateInput } from "@/lib/local-date";
import { recentDeliveryToPayload } from "@/lib/resolve-delivery-payload";

/** Mantém entregas locais do dia que o servidor ainda não devolveu (evita “piscar” na lista). */
export function mergeDeliveryLists(
  server: DeliveryListItem[],
  local: DeliveryListItem[],
  dateFilter: string,
): DeliveryListItem[] {
  const serverIds = new Set(server.map((d) => d.id));
  const extras = local.filter(
    (d) =>
      isIsoOnDateInput(d.occurredAt, dateFilter) && !serverIds.has(d.id),
  );
  if (extras.length === 0) {
    return sortDeliveriesByOccurredAt(server);
  }
  return sortDeliveriesByOccurredAt([...server, ...extras]);
}

function sortDeliveriesByOccurredAt(
  items: DeliveryListItem[],
): DeliveryListItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/** Preserva entregas de hoje no resumo quando o GET /me/today ainda não as inclui. */
export function mergeTodaySummary(
  server: TodaySummary,
  local: TodaySummary | null | undefined,
  todayKey: string,
): TodaySummary {
  if (!local) return server;

  const serverRecentIds = new Set(server.recentDeliveries.map((r) => r.id));
  const missing = local.recentDeliveries.filter(
    (r) =>
      !serverRecentIds.has(r.id) && isIsoOnDateInput(r.occurredAt, todayKey),
  );
  if (missing.length === 0) return server;

  if (server.deliveryCount >= local.deliveryCount) {
    const combined = [
      ...missing,
      ...server.recentDeliveries.filter(
        (r) => !missing.some((m) => m.id === r.id),
      ),
    ].slice(0, 3);
    return { ...server, recentDeliveries: combined };
  }

  let merged = server;
  for (const row of missing) {
    merged = applyDeliveryToToday(merged, recentDeliveryToPayload(row));
  }
  return merged;
}
