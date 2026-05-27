"use client";

import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import type { CreatedDelivery } from "@/lib/app-data-cache";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";

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
      publishAppSync(DELIVERY_SYNC_TOPICS, {
        removedDeliveryId: id,
        removedDelivery: snapshot,
        skipReconcile: true,
      });

      if (id.startsWith("local-")) {
        return { ok: true as const };
      }

      try {
        await api(`/me/deliveries/${id}`, { method: "DELETE" }, { skipSync: true });
        publishAppSync(DELIVERY_SYNC_TOPICS, {
          removedDeliveryId: id,
          removedDelivery: snapshot,
        });
        return { ok: true as const };
      } catch (err) {
        upsertDeliveryOptimistic(snapshot);
        publishAppSync(DELIVERY_SYNC_TOPICS, {
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
