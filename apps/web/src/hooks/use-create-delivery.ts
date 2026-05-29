"use client";

import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import {
  extractDeliveryMutation,
  type CreatedDelivery,
} from "@/lib/app-data-cache";
import { publishDeliverySync } from "@/lib/publish-delivery-sync";
import {
  finishInflightCreate,
  registerInflightCreate,
} from "@/lib/inflight-delivery-create";
import { todayDateInputValue } from "@/lib/local-date";

export type CreateDeliveryInput = {
  grossValue: number;
  source: string;
  originName: string | null;
  distanceKm: number | null;
  occurredAt: string;
};

export function useCreateDelivery() {
  const api = useApi();
  const {
    applyDeliveryOptimistic,
    upsertDeliveryOptimistic,
    removeDeliveryOptimistic,
    publishAppSync,
    setDeliveriesDate,
    isDeliveryCancelled,
  } = useAppData();

  const createDelivery = useCallback(
    async (input: CreateDeliveryInput) => {
      const tempId = `local-${Date.now()}`;
      const tempDelivery: CreatedDelivery = {
        id: tempId,
        grossValue: input.grossValue,
        source: input.source,
        originName: input.originName,
        distanceKm: input.distanceKm,
        occurredAt: input.occurredAt,
      };

      const abort = registerInflightCreate(tempId);

      applyDeliveryOptimistic(tempDelivery);
      setDeliveriesDate(todayDateInputValue(new Date(input.occurredAt)));
      publishDeliverySync(publishAppSync, "optimistic", {
        delivery: tempDelivery,
      });

      try {
        const created = await api<Record<string, unknown>>(
          "/me/deliveries",
          {
            method: "POST",
            body: JSON.stringify({
              grossValue: input.grossValue,
              source: input.source,
              originName: input.originName,
              distanceKm: input.distanceKm,
              occurredAt: input.occurredAt,
            }),
            signal: abort.signal,
          },
          { skipSync: true },
        );

        if (isDeliveryCancelled(tempId)) {
          const parsed =
            extractDeliveryMutation(created, "/me/deliveries", "POST")
              .delivery ??
            ({
              id: String(created.id ?? tempId),
              grossValue: input.grossValue,
              source: input.source,
              originName: input.originName,
              distanceKm: input.distanceKm,
              occurredAt: input.occurredAt,
            } satisfies CreatedDelivery);

          if (!parsed.id.startsWith("local-")) {
            try {
              await api(
                `/me/deliveries/${encodeURIComponent(parsed.id)}`,
                { method: "DELETE" },
                { skipSync: true },
              );
            } catch {
              /* servidor pode já ter sido limpo */
            }
          }
          removeDeliveryOptimistic(tempId, tempDelivery);
          publishDeliverySync(publishAppSync, "optimistic", {
            removedDeliveryId: tempId,
            removedDelivery: tempDelivery,
          });
          return { ok: true as const, cancelled: true as const };
        }

        const parsed =
          extractDeliveryMutation(created, "/me/deliveries", "POST").delivery ??
          ({
            id: String(created.id ?? tempId),
            grossValue: input.grossValue,
            source: input.source,
            originName: input.originName,
            distanceKm: input.distanceKm,
            occurredAt: input.occurredAt,
          } satisfies CreatedDelivery);

        const realDelivery: CreatedDelivery = {
          ...parsed,
          occurredAt: input.occurredAt,
        };

        upsertDeliveryOptimistic(realDelivery, tempDelivery);
        publishDeliverySync(publishAppSync, "confirmed", {
          delivery: realDelivery,
          previousDelivery: tempDelivery,
        });

        return { ok: true as const, delivery: realDelivery };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          removeDeliveryOptimistic(tempId, tempDelivery);
          publishDeliverySync(publishAppSync, "optimistic", {
            removedDeliveryId: tempId,
            removedDelivery: tempDelivery,
          });
          return { ok: true as const, cancelled: true as const };
        }

        if (isDeliveryCancelled(tempId)) {
          removeDeliveryOptimistic(tempId, tempDelivery);
          return { ok: true as const, cancelled: true as const };
        }

        removeDeliveryOptimistic(tempId, tempDelivery);
        publishDeliverySync(publishAppSync, "optimistic", {
          removedDeliveryId: tempId,
          removedDelivery: tempDelivery,
        });
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível salvar. Tente de novo.";
        return { ok: false as const, error: message };
      } finally {
        finishInflightCreate(tempId);
      }
    },
    [
      api,
      applyDeliveryOptimistic,
      isDeliveryCancelled,
      publishAppSync,
      removeDeliveryOptimistic,
      setDeliveriesDate,
      upsertDeliveryOptimistic,
    ],
  );

  return { createDelivery };
}
