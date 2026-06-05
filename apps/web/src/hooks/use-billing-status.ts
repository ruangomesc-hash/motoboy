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

    void api<SubscriptionStatus>("/me/subscription")
      .then((data) => {
        setSubscription(data);
        setLoadState("ready");
        if (data.asaas?.configured === true) {
          setAsaasConfigured(true);
        } else if (data.asaas?.configured === false) {
          setAsaasConfigured(false);
        }
      })
      .catch(() => {
        setSubscription(null);
        setLoadState("error");
        setAsaasConfigured(null);
      });

    // Health completo pode levar dezenas de segundos — não bloqueia o formulário Pix.
    void fetchSystemHealth({ timeoutMs: 8_000 }).then((healthSnap) => {
      const fromHealth = healthSnap.health?.asaas?.configured;
      if (fromHealth === true) {
        setAsaasConfigured(true);
      } else if (fromHealth === false) {
        setAsaasConfigured(false);
      }
    });
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
