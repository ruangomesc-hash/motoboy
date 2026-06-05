"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubscribeResponse } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import { PAYMENT_POLL_FAST_MS, PAYMENT_POLL_MAX_MS } from "./shared";

export type PaymentActivatedHandler = (subscribedAt?: string | null) => void;

export function usePaymentActivationPoll(
  checkout: SubscribeResponse | null,
  onActivated?: PaymentActivatedHandler,
) {
  const api = useApi();
  const [polling, setPolling] = useState(false);
  const [pollHint, setPollHint] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [checkInFlight, setCheckInFlight] = useState(false);
  const pollStartedAt = useRef<number | null>(null);
  const onActivatedRef = useRef(onActivated);
  onActivatedRef.current = onActivated;

  const checkActivation = useCallback(async (): Promise<boolean> => {
    const chargeId = checkout?.chargeId;
    setCheckInFlight(true);
    try {
      const refreshed = await api<{
        status: string;
        activated: boolean;
        subscribedAt?: string | null;
      }>(
        "/me/subscription/refresh",
        {
          method: "POST",
          body: JSON.stringify(
            chargeId ? { chargeId } : {},
          ),
        },
        { skipSync: true },
      );

      if (refreshed.activated || refreshed.status === "ACTIVE") {
        setPolling(false);
        setPollHint("");
        onActivatedRef.current?.(refreshed.subscribedAt ?? null);
        return true;
      }
    } catch {
      /* falha transitória — próximo poll tenta de novo */
    } finally {
      setCheckInFlight(false);
    }
    return false;
  }, [api, checkout?.chargeId]);

  useEffect(() => {
    if (!checkout?.chargeId || !polling) {
      return;
    }

    pollStartedAt.current ??= Date.now();

    const run = () => {
      const elapsed = Date.now() - (pollStartedAt.current ?? Date.now());
      if (elapsed > PAYMENT_POLL_MAX_MS) {
        setPolling(false);
        setPollHint(
          "Se já pagou, toque em Verificar pagamento para atualizar o status.",
        );
        return;
      }
      void checkActivation();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void checkActivation();
    };

    void checkActivation();
    const id = window.setInterval(run, PAYMENT_POLL_FAST_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [checkout?.chargeId, polling, checkActivation]);

  function startPolling() {
    setPolling(true);
    pollStartedAt.current = Date.now();
    setPollHint("");
  }

  function stopPolling() {
    setPolling(false);
    setPollHint("");
    pollStartedAt.current = null;
  }

  async function verifyPayment() {
    setRefreshing(true);
    try {
      const ok = await checkActivation();
      if (!ok) {
        setPollHint(
          "Pagamento ainda não confirmado. Aguarde alguns segundos e tente de novo.",
        );
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
    checkInFlight,
    startPolling,
    stopPolling,
    verifyPayment,
  };
}
