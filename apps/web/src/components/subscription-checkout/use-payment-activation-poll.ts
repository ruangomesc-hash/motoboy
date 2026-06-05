"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubscribeResponse, SubscriptionStatus } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import { PAYMENT_POLL_MAX_MS, PAYMENT_POLL_MS } from "./shared";

export function usePaymentActivationPoll(
  checkout: SubscribeResponse | null,
  onActivated?: () => void,
) {
  const api = useApi();
  const [polling, setPolling] = useState(false);
  const [pollHint, setPollHint] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const pollStartedAt = useRef<number | null>(null);
  const pollTick = useRef(0);

  const checkActivation = useCallback(
    async (forceSync = false) => {
      try {
        if (forceSync) {
          await api<{ status: string; activated: boolean }>(
            "/me/subscription/refresh",
            { method: "POST" },
            { skipSync: true },
          );
        }
        const sub = await api<SubscriptionStatus>("/me/subscription", {}, {
          skipSync: true,
        });
        if (sub.status === "ACTIVE") {
          setPolling(false);
          setPollHint("");
          onActivated?.();
          return true;
        }
      } catch {
        /* ignora */
      }
      return false;
    },
    [api, onActivated],
  );

  useEffect(() => {
    if (!checkout || !polling) return;
    pollStartedAt.current ??= Date.now();
    const id = window.setInterval(() => {
      pollTick.current += 1;
      const elapsed = Date.now() - (pollStartedAt.current ?? Date.now());
      if (elapsed > PAYMENT_POLL_MAX_MS) {
        setPolling(false);
        setPollHint(
          "Se já pagou, toque em Verificar pagamento para atualizar o status.",
        );
        return;
      }
      void checkActivation(pollTick.current % 3 === 0);
    }, PAYMENT_POLL_MS);
    return () => window.clearInterval(id);
  }, [checkout, polling, checkActivation]);

  function startPolling() {
    setPolling(true);
    pollStartedAt.current = Date.now();
    pollTick.current = 0;
    void checkActivation(true);
  }

  function stopPolling() {
    setPolling(false);
    setPollHint("");
    pollStartedAt.current = null;
    pollTick.current = 0;
  }

  async function verifyPayment() {
    setRefreshing(true);
    try {
      const ok = await checkActivation(true);
      if (!ok) {
        setPollHint("Pagamento ainda não confirmado. Tente novamente em instantes.");
        if (!polling) setPolling(true);
      }
    } finally {
      setRefreshing(false);
    }
  }

  return {
    polling,
    pollHint,
    refreshing,
    startPolling,
    stopPolling,
    verifyPayment,
  };
}
