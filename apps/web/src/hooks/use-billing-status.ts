"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  refresh: (opts?: { silent?: boolean }) => void;
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

  const refresh = useCallback(
    (opts?: { silent?: boolean }) => {
      if (!enabled || sessionStatus !== "authenticated") return;
      const silent = opts?.silent === true;

      if (!hadSuccessfulLoad.current) {
        setLoadState("loading");
      }

      void fetchSystemHealth({ timeoutMs: 5_000 }).then((healthSnap) => {
        applyAsaasFromHealth(healthSnap.health?.asaas?.configured);
      });

      void (async () => {
        const maxAttempts = 3;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const data = await api<SubscriptionStatus>(
              "/me/subscription",
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
              await sleep(800 * (attempt + 1));
              continue;
            }
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
          }
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
      asaasFromHealth.current = null;
      hadSuccessfulLoad.current = false;
      return;
    }
    refreshRef.current();
  }, [sessionStatus]);

  return { subscription, loadState, asaasConfigured, refresh };
}
