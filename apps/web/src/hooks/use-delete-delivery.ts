"use client";

import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import type { CreatedDelivery } from "@/lib/app-data-cache";
import { publishDeliverySync } from "@/lib/publish-delivery-sync";
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
        publishDeliverySync(publishAppSync, "optimistic", {
          removedDeliveryId: id,
          removedDelivery: snapshot,
        });
        return Promise.resolve({ ok: true as const });
      }

      removeDeliveryOptimistic(id, snapshot);
      publishDeliverySync(publishAppSync, "optimistic", {
        removedDeliveryId: id,
        removedDelivery: snapshot,
      });

      void (async () => {
        try {
          await api(
            deliveryPath(id),
            { method: "DELETE" },
            { skipSync: true },
          );
          publishDeliverySync(publishAppSync, "confirmed", {
            removedDeliveryId: id,
            removedDelivery: snapshot,
          });
        } catch (err) {
          upsertDeliveryOptimistic(snapshot);
          publishDeliverySync(publishAppSync, "optimistic", {
            delivery: snapshot,
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
