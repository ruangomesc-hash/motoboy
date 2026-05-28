import type { TodaySummary } from "@motoboy/types";
import { applyDeliveryToToday } from "@/lib/app-data-cache";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { isIsoOnDateInput } from "@/lib/local-date";
import { recentDeliveryToPayload } from "@/lib/resolve-delivery-payload";

function isPendingDeliveryId(id: string): boolean {
  return id.startsWith("local-");
}

/** Mantém só entregas `local-*` em voo; servidor é a fonte da verdade para IDs reais. */
export function mergeDeliveryLists(
  server: DeliveryListItem[],
  local: DeliveryListItem[],
  dateFilter: string,
): DeliveryListItem[] {
  const serverIds = new Set(server.map((d) => d.id));
  const pending = local.filter(
    (d) =>
      isPendingDeliveryId(d.id) &&
      isIsoOnDateInput(d.occurredAt, dateFilter) &&
      !serverIds.has(d.id),
  );
  if (pending.length === 0) {
    return sortDeliveriesByOccurredAt(server);
  }
  return sortDeliveriesByOccurredAt([...server, ...pending]);
}

function sortDeliveriesByOccurredAt(
  items: DeliveryListItem[],
): DeliveryListItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/** Só acrescenta entregas pendentes (`local-*`) ao resumo do dia; evita duplicar totais. */
export function mergeTodaySummary(
  server: TodaySummary,
  local: TodaySummary | null | undefined,
  todayKey: string,
): TodaySummary {
  if (!local) return server;

  const serverIds = new Set(server.recentDeliveries.map((r) => r.id));
  const pending = local.recentDeliveries.filter(
    (r) =>
      isPendingDeliveryId(r.id) &&
      !serverIds.has(r.id) &&
      isIsoOnDateInput(r.occurredAt, todayKey),
  );
  if (pending.length === 0) return server;

  let merged = server;
  for (const row of pending) {
    merged = applyDeliveryToToday(merged, recentDeliveryToPayload(row));
  }
  return merged;
}

/** Remove duplicatas por id (mantém a primeira ocorrência). */
export function dedupeRecentDeliveries<
  T extends { id: string },
>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}
