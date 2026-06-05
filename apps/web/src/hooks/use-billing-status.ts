"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import type { SubscriptionStatus } from "@motoboy/types";
import { fetchSystemHealth } from "@/lib/system-health";

export type BillingStatusLoadState = "idle" | "loading" | "ready" | "error";

export type BillingRefreshOptions = {
  silent?: boolean;
  /** Pula health check e retries — uso após confirmação de pagamento. */
  fast?: boolean;
  /** Sincroniza e grava próximo vencimento no Asaas (mais lento). */
  syncBilling?: boolean;
};

export type BillingStatusSnapshot = {
  subscription: SubscriptionStatus | null;
  loadState: BillingStatusLoadState;
  refreshing: boolean;
  /** null = não foi possível verificar (ex.: health indisponível) */
  asaasConfigured: boolean | null;
  refresh: (opts?: BillingRefreshOptions) => void;
  /** Atualiza a UI na hora quando o pagamento foi confirmado. */
  applyActiveStatus: (subscribedAt?: string | null) => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fallbackSubscription(
  asaasConfigured: boolean | null,
): SubscriptionStatus {
  return {
    status: "TRIAL",
    trialEndsAt: null,
    trialDays: 4,
    subscribedAt: null,
    subscriptionPaymentMethod: "PIX",
    lastPayment: null,
    asaas: {
      configured: asaasConfigured === true,
      webhookPath: "/api/backend/webhooks/asaas",
      webhookTokenConfigured: false,
      sandbox: false,
      apiBaseUrl: "https://api.asaas.com/v3",
    },
  };
}

/**
 * Status de assinatura + Asaas. Falhas transitórias não bloqueiam o checkout Pix.
 */
export function useBillingStatus(enabled = true): BillingStatusSnapshot {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadState, setLoadState] = useState<BillingStatusLoadState>("idle");
  const [refreshing, setRefreshing] = useState(false);
  const [asaasConfigured, setAsaasConfigured] = useState<boolean | null>(null);
  const hadSuccessfulLoad = useRef(false);
  const asaasFromHealth = useRef<boolean | null>(null);

  const applyAsaasFromHealth = useCallback((configured: boolean | undefined) => {
    if (configured === true) {
      asaasFromHealth.current = true;
      setAsaasConfigured(true);
    } else if (configured === false) {
      asaasFromHealth.current = false;
      setAsaasConfigured(false);
    }
  }, []);

  const applyActiveStatus = useCallback((subscribedAt?: string | null) => {
    setSubscription((prev) => {
      const base = prev ?? fallbackSubscription(asaasFromHealth.current);
      return {
        ...base,
        status: "ACTIVE",
        subscribedAt:
          subscribedAt ??
          base.subscribedAt ??
          new Date().toISOString(),
      };
    });
    setLoadState("ready");
    hadSuccessfulLoad.current = true;
  }, []);

  const refresh = useCallback(
    (opts?: BillingRefreshOptions) => {
      if (!enabled || sessionStatus !== "authenticated") return;
      const silent = opts?.silent === true;
      const fast = opts?.fast === true;
      const syncBilling = opts?.syncBilling === true;

      if (!hadSuccessfulLoad.current) {
        setLoadState("loading");
      }
      if (!silent || syncBilling) {
        setRefreshing(true);
      }

      if (!fast) {
        void fetchSystemHealth({ timeoutMs: fast ? 2_000 : 5_000 }).then(
          (healthSnap) => {
            applyAsaasFromHealth(healthSnap.health?.asaas?.configured);
          },
        );
      }

      void (async () => {
        const maxAttempts = fast ? 1 : 3;
        try {
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
              const subPath = syncBilling
                ? "/me/subscription?sync=1"
                : "/me/subscription";
              const data = await api<SubscriptionStatus>(
                subPath,
                {},
                { skipSync: true },
              );
              setSubscription(data);
              setLoadState("ready");
              hadSuccessfulLoad.current = true;
              if (data.asaas?.configured === true) {
                setAsaasConfigured(true);
              } else if (data.asaas?.configured === false) {
                setAsaasConfigured(false);
              }
              return;
            } catch {
              if (attempt < maxAttempts - 1) {
                await sleep(fast ? 300 : 800 * (attempt + 1));
                continue;
              }
              throw new Error("subscription fetch failed");
            }
          }
        } catch {
          if (hadSuccessfulLoad.current) {
            setLoadState("ready");
            return;
          }
          if (asaasFromHealth.current === true) {
            setSubscription(fallbackSubscription(true));
            setLoadState("ready");
            return;
          }
          setSubscription(fallbackSubscription(asaasFromHealth.current));
          setLoadState(asaasFromHealth.current === null ? "error" : "ready");
        } finally {
          setRefreshing(false);
        }
      })();
    },
    [api, applyAsaasFromHealth, enabled, sessionStatus],
  );

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus !== "authenticated") {
      setLoadState("idle");
      setSubscription(null);
      setAsaasConfigured(null);
      setRefreshing(false);
      asaasFromHealth.current = null;
      hadSuccessfulLoad.current = false;
      return;
    }
    refreshRef.current();
  }, [sessionStatus]);

  return {
    subscription,
    loadState,
    refreshing,
    asaasConfigured,
    refresh,
    applyActiveStatus,
  };
}
