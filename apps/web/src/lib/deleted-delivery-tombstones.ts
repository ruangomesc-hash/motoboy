import type { TodaySummary } from "@motoboy/types";
import {
  removeDeliveryFromToday,
  type CreatedDelivery,
} from "@/lib/app-data-cache";

/** IDs apagados localmente — evita que poll/cache traga a entrega de volta antes do servidor confirmar. */
export function createDeletedDeliveryRegistry() {
  const ids = new Set<string>();

  return {
    mark(id: string) {
      ids.add(id);
    },
    unmark(id: string) {
      ids.delete(id);
    },
    has(id: string) {
      return ids.has(id);
    },
    clear() {
      ids.clear();
    },
    toArray(): string[] {
      return [...ids];
    },
    hydrate(remoteIds: string[]) {
      for (const id of remoteIds) ids.add(id);
    },
    filter<T extends { id: string }>(items: T[]): T[] {
      if (ids.size === 0) return items;
      return items.filter((d) => !ids.has(d.id));
    },
    /** Remove tombstone quando o servidor já não devolve mais o id. */
    pruneConfirmedAbsent(serverItemIds: Iterable<string>) {
      const onServer = new Set(serverItemIds);
      for (const id of [...ids]) {
        if (!onServer.has(id)) ids.delete(id);
      }
    },
    applyToTodaySummary(server: TodaySummary): TodaySummary {
      if (ids.size === 0) return server;
      let merged = server;
      for (const id of ids) {
        const row = merged.recentDeliveries.find((d) => d.id === id);
        if (!row) continue;
        const payload: CreatedDelivery = {
          id: row.id,
          grossValue: row.grossValue,
          source: row.source,
          originName: row.originName,
          occurredAt: row.occurredAt,
          distanceKm: null,
        };
        merged = removeDeliveryFromToday(merged, payload);
      }
      return merged;
    },
  };
}

export type DeletedDeliveryRegistry = ReturnType<
  typeof createDeletedDeliveryRegistry
>;
