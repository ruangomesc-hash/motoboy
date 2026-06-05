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

/**
 * Status de assinatura + Asaas. Falhas transitórias não apagam dados já carregados.
 */
export function useBillingStatus(enabled = true): BillingStatusSnapshot {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadState, setLoadState] = useState<BillingStatusLoadState>("idle");
  const [asaasConfigured, setAsaasConfigured] = useState<boolean | null>(null);
  const hadSuccessfulLoad = useRef(false);

  const refresh = useCallback(
    (opts?: { silent?: boolean }) => {
      if (!enabled || sessionStatus !== "authenticated") return;
      const silent = opts?.silent === true;

      if (!silent || !hadSuccessfulLoad.current) {
        setLoadState("loading");
      }

      void api<SubscriptionStatus>("/me/subscription", {}, { skipSync: true })
        .then((data) => {
          setSubscription(data);
          setLoadState("ready");
          hadSuccessfulLoad.current = true;
          if (data.asaas?.configured === true) {
            setAsaasConfigured(true);
          } else if (data.asaas?.configured === false) {
            setAsaasConfigured(false);
          }
        })
        .catch(() => {
          if (hadSuccessfulLoad.current) {
            setLoadState("ready");
            return;
          }
          setSubscription(null);
          setLoadState("error");
          setAsaasConfigured(null);
        });

      void fetchSystemHealth({ timeoutMs: 6_000 }).then((healthSnap) => {
        const fromHealth = healthSnap.health?.asaas?.configured;
        if (fromHealth === true) {
          setAsaasConfigured(true);
        } else if (fromHealth === false) {
          setAsaasConfigured(false);
        }
      });
    },
    [api, enabled, sessionStatus],
  );

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus !== "authenticated") {
      setLoadState("idle");
      setSubscription(null);
      setAsaasConfigured(null);
      hadSuccessfulLoad.current = false;
      return;
    }
    refresh();
  }, [sessionStatus, refresh]);

  return { subscription, loadState, asaasConfigured, refresh };
}
