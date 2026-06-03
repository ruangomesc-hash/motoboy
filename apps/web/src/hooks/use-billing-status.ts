"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import type { SubscriptionStatus } from "@motoboy/types";
import { fetchSystemHealth } from "@/lib/system-health";

export type BillingStatusLoadState = "idle" | "loading" | "ready" | "error";

export type BillingStatusSnapshot = {
  subscription: SubscriptionStatus | null;
  loadState: BillingStatusLoadState;
  /** null = não foi possível verificar (ex.: health indisponível) */
  asaasConfigured: boolean | null;
  refresh: () => void;
};

/**
 * Status de assinatura + Asaas. Usa GET /me/subscription e GET /api/backend/health
 * para não marcar pagamento como “não configurado” quando só a rota autenticada falhou.
 */
export function useBillingStatus(enabled = true): BillingStatusSnapshot {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadState, setLoadState] = useState<BillingStatusLoadState>("idle");
  const [asaasConfigured, setAsaasConfigured] = useState<boolean | null>(null);

  const refresh = useCallback(() => {
    if (!enabled || sessionStatus !== "authenticated") return;
    setLoadState("loading");

    void (async () => {
      const [subResult, healthSnap] = await Promise.all([
        api<SubscriptionStatus>("/me/subscription").then(
          (data) => ({ ok: true as const, data }),
          () => ({ ok: false as const, data: null }),
        ),
        fetchSystemHealth(),
      ]);

      if (subResult.ok) {
        setSubscription(subResult.data);
        setLoadState("ready");
      } else {
        setSubscription(null);
        setLoadState("error");
      }

      const fromHealth = healthSnap.health?.asaas?.configured;
      const fromSub = subResult.ok ? subResult.data.asaas?.configured : undefined;

      if (fromHealth === true || fromSub === true) {
        setAsaasConfigured(true);
      } else if (fromHealth === false || fromSub === false) {
        setAsaasConfigured(false);
      } else {
        setAsaasConfigured(null);
      }
    })();
  }, [api, enabled, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus !== "authenticated") {
      setLoadState("idle");
      setSubscription(null);
      setAsaasConfigured(null);
      return;
    }
    refresh();
  }, [sessionStatus, refresh]);

  return { subscription, loadState, asaasConfigured, refresh };
}
