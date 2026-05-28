"use client";

import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import {
  extractDeliveryMutation,
  type CreatedDelivery,
} from "@/lib/app-data-cache";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";
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
    refreshToday,
    refreshDeliveries,
    refreshStats,
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

      applyDeliveryOptimistic(tempDelivery);
      setDeliveriesDate(todayDateInputValue(new Date(input.occurredAt)));
      publishAppSync(DELIVERY_SYNC_TOPICS, {
        delivery: tempDelivery,
        skipReconcile: true,
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
          },
          { skipSync: true },
        );

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
        publishAppSync(DELIVERY_SYNC_TOPICS, {
          delivery: realDelivery,
          previousDelivery: tempDelivery,
          skipReconcile: true,
        });

        void Promise.all([
          refreshToday(),
          refreshDeliveries(),
          refreshStats("week"),
          refreshStats("month"),
        ]);

        return { ok: true as const, delivery: realDelivery };
      } catch (err) {
        removeDeliveryOptimistic(tempId, tempDelivery);
        publishAppSync(DELIVERY_SYNC_TOPICS, {
          removedDeliveryId: tempId,
          removedDelivery: tempDelivery,
          skipReconcile: true,
        });
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível salvar. Tente de novo.";
        return { ok: false as const, error: message };
      }
    },
    [
      api,
      applyDeliveryOptimistic,
      publishAppSync,
      removeDeliveryOptimistic,
      refreshDeliveries,
      refreshStats,
      refreshToday,
      setDeliveriesDate,
      upsertDeliveryOptimistic,
    ],
  );

  return { createDelivery };
}
