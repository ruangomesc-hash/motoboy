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

export type CreateExpenseInput = {
  grossValue: number;
  originName: string | null;
  occurredAt: string;
};

export function useCreateExpense() {
  const api = useApi();
  const {
    applyDeliveryOptimistic,
    upsertDeliveryOptimistic,
    removeDeliveryOptimistic,
    publishAppSync,
    setDeliveriesDate,
    isDeliveryCancelled,
  } = useAppData();

  const createExpense = useCallback(
    async (input: CreateExpenseInput) => {
      const storedGross = -Math.abs(input.grossValue);
      const tempId = `local-${Date.now()}`;
      const tempExpense: CreatedDelivery = {
        id: tempId,
        grossValue: storedGross,
        source: "OTHER",
        originName: input.originName,
        distanceKm: null,
        occurredAt: input.occurredAt,
      };

      const abort = registerInflightCreate(tempId);

      applyDeliveryOptimistic(tempExpense);
      setDeliveriesDate(todayDateInputValue(new Date(input.occurredAt)));
      publishDeliverySync(publishAppSync, "optimistic", {
        delivery: tempExpense,
      });

      try {
        const created = await api<Record<string, unknown>>(
          "/me/expenses",
          {
            method: "POST",
            body: JSON.stringify({
              grossValue: Math.abs(input.grossValue),
              originName: input.originName,
              occurredAt: input.occurredAt,
            }),
            signal: abort.signal,
          },
          { skipSync: true },
        );

        if (isDeliveryCancelled(tempId)) {
          const parsed =
            extractDeliveryMutation(created, "/me/expenses", "POST")
              .delivery ??
            ({
              id: String(created.id ?? tempId),
              grossValue: storedGross,
              source: "OTHER",
              originName: input.originName,
              distanceKm: null,
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
          removeDeliveryOptimistic(tempId, tempExpense);
          publishDeliverySync(publishAppSync, "optimistic", {
            removedDeliveryId: tempId,
            removedDelivery: tempExpense,
          });
          return { ok: true as const, cancelled: true as const };
        }

        const parsed =
          extractDeliveryMutation(created, "/me/expenses", "POST").delivery ??
          ({
            id: String(created.id ?? tempId),
            grossValue: storedGross,
            source: "OTHER",
            originName: input.originName,
            distanceKm: null,
            occurredAt: input.occurredAt,
          } satisfies CreatedDelivery);

        const realExpense: CreatedDelivery = {
          ...parsed,
          grossValue:
            Number(parsed.grossValue) < 0
              ? parsed.grossValue
              : storedGross,
          occurredAt: input.occurredAt,
        };

        upsertDeliveryOptimistic(realExpense, tempExpense);
        publishDeliverySync(publishAppSync, "confirmed", {
          delivery: realExpense,
          previousDelivery: tempExpense,
        });

        return { ok: true as const, delivery: realExpense };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          removeDeliveryOptimistic(tempId, tempExpense);
          publishDeliverySync(publishAppSync, "optimistic", {
            removedDeliveryId: tempId,
            removedDelivery: tempExpense,
          });
          return { ok: true as const, cancelled: true as const };
        }

        if (isDeliveryCancelled(tempId)) {
          removeDeliveryOptimistic(tempId, tempExpense);
          return { ok: true as const, cancelled: true as const };
        }

        removeDeliveryOptimistic(tempId, tempExpense);
        publishDeliverySync(publishAppSync, "optimistic", {
          removedDeliveryId: tempId,
          removedDelivery: tempExpense,
        });
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível salvar. Tente novamente.";
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

  return { createExpense };
}
