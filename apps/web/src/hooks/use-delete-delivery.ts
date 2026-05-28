"use client";

import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import type { CreatedDelivery } from "@/lib/app-data-cache";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";
import { abortInflightCreate } from "@/lib/inflight-delivery-create";

function deliveryPath(id: string): string {
  return `/me/deliveries/${encodeURIComponent(id)}`;
}

export function useDeleteDelivery() {
  const api = useApi();
  const {
    removeDeliveryOptimistic,
    publishAppSync,
    scheduleDeliveryReconcile,
    markDeliveryCancelled,
  } = useAppData();

  const deleteDelivery = useCallback(
    async (id: string, snapshot: CreatedDelivery) => {
      if (id.startsWith("local-")) {
        markDeliveryCancelled(id);
        abortInflightCreate(id);
        removeDeliveryOptimistic(id, snapshot);
        publishAppSync(DELIVERY_SYNC_TOPICS, {
          removedDeliveryId: id,
          removedDelivery: snapshot,
          skipReconcile: true,
        });
        return { ok: true as const };
      }

      try {
        await api(
          deliveryPath(id),
          { method: "DELETE" },
          { skipSync: true },
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível apagar no servidor.";
        return { ok: false as const, error: message };
      }

      removeDeliveryOptimistic(id, snapshot);
      publishAppSync(DELIVERY_SYNC_TOPICS, {
        removedDeliveryId: id,
        removedDelivery: snapshot,
        skipReconcile: true,
      });
      scheduleDeliveryReconcile();
      return { ok: true as const };
    },
    [
      api,
      markDeliveryCancelled,
      publishAppSync,
      removeDeliveryOptimistic,
      scheduleDeliveryReconcile,
    ],
  );

  return { deleteDelivery };
}
