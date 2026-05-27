"use client";

import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import type { CreatedDelivery } from "@/lib/app-data-cache";
import type { AppSyncTopic } from "@/lib/app-sync";

const DELETE_SYNC_TOPICS: AppSyncTopic[] = [
  "deliveries",
  "today",
  "stats",
  "history",
];

export function useDeleteDelivery() {
  const api = useApi();
  const {
    removeDeliveryOptimistic,
    upsertDeliveryOptimistic,
    publishAppSync,
  } = useAppData();

  const deleteDelivery = useCallback(
    async (id: string, snapshot: CreatedDelivery) => {
      removeDeliveryOptimistic(id, snapshot);
      publishAppSync(DELETE_SYNC_TOPICS, {
        removedDeliveryId: id,
        removedDelivery: snapshot,
        skipReconcile: true,
      });

      if (id.startsWith("local-")) {
        return { ok: true as const };
      }

      try {
        await api(`/me/deliveries/${id}`, { method: "DELETE" }, { skipSync: true });
        publishAppSync(DELETE_SYNC_TOPICS, {
          removedDeliveryId: id,
          removedDelivery: snapshot,
        });
        return { ok: true as const };
      } catch (err) {
        upsertDeliveryOptimistic(snapshot);
        publishAppSync(DELETE_SYNC_TOPICS, {
          delivery: snapshot,
          skipReconcile: true,
        });
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível apagar no servidor.";
        return { ok: false as const, error: message };
      }
    },
    [api, publishAppSync, removeDeliveryOptimistic, upsertDeliveryOptimistic],
  );

  return { deleteDelivery };
}
