"use client";

import { useCallback } from "react";
import type { DailyCostKey } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import { publishDailyCostSync } from "@/lib/publish-daily-cost-sync";
import { todayDateInputValue } from "@/lib/local-date";

export function useExcludeDailyCost() {
  const api = useApi();
  const {
    excludeDailyCostOptimistic,
    restoreDailyCostOptimistic,
    publishAppSync,
  } = useAppData();

  const excludeDailyCost = useCallback(
    (
      costKey: DailyCostKey,
      amount: number,
      dateKey: string = todayDateInputValue(),
    ) => {
      excludeDailyCostOptimistic(costKey, dateKey, amount);
      publishDailyCostSync(publishAppSync, "optimistic", {
        excludedDailyCost: { dateKey, costKey, amount },
      });

      void (async () => {
        try {
          await api(
            "/me/daily-cost-exclusions",
            {
              method: "POST",
              body: JSON.stringify({ dateKey, costKey }),
            },
            { skipSync: true },
          );
          publishDailyCostSync(publishAppSync, "confirmed", {
            excludedDailyCost: { dateKey, costKey, amount },
          });
        } catch (err) {
          restoreDailyCostOptimistic(costKey, dateKey, amount);
          publishDailyCostSync(publishAppSync, "optimistic", {
            restoredDailyCost: { dateKey, costKey, amount },
          });
          const message =
            err instanceof Error
              ? err.message
              : "Não foi possível remover o custo no servidor.";
          if (typeof window !== "undefined") {
            window.alert(
              `${message}\n\nO custo foi recolocado no resumo.`,
            );
          }
        }
      })();

      return Promise.resolve({ ok: true as const });
    },
    [
      api,
      excludeDailyCostOptimistic,
      publishAppSync,
      restoreDailyCostOptimistic,
    ],
  );

  return { excludeDailyCost };
}
