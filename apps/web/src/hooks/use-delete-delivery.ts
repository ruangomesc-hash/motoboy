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
    upsertDeliveryOptimistic,
    publishAppSync,
    markDeliveryCancelled,
  } = useAppData();

  const deleteDelivery = useCallback(
    (id: string, snapshot: CreatedDelivery) => {
      if (id.startsWith("local-")) {
        markDeliveryCancelled(id);
        abortInflightCreate(id);
        removeDeliveryOptimistic(id, snapshot);
        publishAppSync(DELIVERY_SYNC_TOPICS, {
          removedDeliveryId: id,
          removedDelivery: snapshot,
          skipReconcile: true,
        });
        return Promise.resolve({ ok: true as const });
      }

      removeDeliveryOptimistic(id, snapshot);
      publishAppSync(DELIVERY_SYNC_TOPICS, {
        removedDeliveryId: id,
        removedDelivery: snapshot,
        skipReconcile: true,
      });

      void (async () => {
        try {
          await api(
            deliveryPath(id),
            { method: "DELETE" },
            { skipSync: true },
          );
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
          if (typeof window !== "undefined") {
            window.alert(
              `${message}\n\nA entrega foi recolocada na lista.`,
            );
          }
        }
      })();

      return Promise.resolve({ ok: true as const });
    },
    [
      api,
      markDeliveryCancelled,
      publishAppSync,
      removeDeliveryOptimistic,
      upsertDeliveryOptimistic,
    ],
  );

  return { deleteDelivery };
}
