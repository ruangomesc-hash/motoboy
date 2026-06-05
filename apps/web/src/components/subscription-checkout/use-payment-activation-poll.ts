"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubscribeResponse, SubscriptionPaymentMethod } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import {
  CARD_AUTHORIZE_PENDING_CHARGE,
  PAYMENT_POLL_FAST_MS,
  PAYMENT_POLL_MAX_MS,
} from "./shared";

export type PaymentActivatedHandler = (
  subscribedAt?: string | null,
  paymentMethod?: SubscriptionPaymentMethod,
) => void;

type CardCheckoutStatusResponse = {
  status: string;
  activated: boolean;
  subscribedAt: string | null;
  pending: {
    chargeId: string;
    subscriptionId: string;
    amount: number;
    cardAuthorized: true;
  } | null;
};

type LiteSubscriptionStatus = {
  status: string;
  subscribedAt: string | null;
};

type PollOptions = {
  onCheckoutResolved?: (data: SubscribeResponse) => void;
};

function buildCardStatusPath(chargeId?: string, forceSync = false): string {
  const params = new URLSearchParams();
  if (forceSync) params.set("sync", "1");
  if (chargeId?.trim()) params.set("chargeId", chargeId.trim());
  const qs = params.toString();
  return qs ? `/me/subscribe/card/status?${qs}` : "/me/subscribe/card/status";
}

export function usePaymentActivationPoll(
  checkout: SubscribeResponse | null,
  onActivated?: PaymentActivatedHandler,
  options?: PollOptions,
) {
  const api = useApi();
  const [polling, setPolling] = useState(false);
  const [pollHint, setPollHint] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [checkInFlight, setCheckInFlight] = useState(false);
  const pollStartedAt = useRef<number | null>(null);
  const pollTickRef = useRef(0);
  const inFlightRef = useRef(false);
  const onActivatedRef = useRef(onActivated);
  const onCheckoutResolvedRef = useRef(options?.onCheckoutResolved);
  onActivatedRef.current = onActivated;
  onCheckoutResolvedRef.current = options?.onCheckoutResolved;

  const checkActivation = useCallback(
    async (forceAsaasSync = false): Promise<boolean> => {
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setCheckInFlight(true);

      const chargeId = checkout?.chargeId;
      const subscriptionId = checkout?.subscriptionId;
      const paymentMethod = checkout?.paymentMethod;

      try {
        if (paymentMethod === "CREDIT_CARD") {
          pollTickRef.current += 1;
          const tick = pollTickRef.current;
          const knownCharge =
            chargeId && chargeId !== CARD_AUTHORIZE_PENDING_CHARGE
              ? chargeId
              : undefined;

          const lite = await api<LiteSubscriptionStatus>(
            "/me/subscription?lite=1",
            {},
            { skipSync: true },
          ).catch(() => null);

          if (lite?.status === "ACTIVE") {
            setPolling(false);
            setPollHint("");
            onActivatedRef.current?.(lite.subscribedAt ?? null, "CREDIT_CARD");
            return true;
          }

          const shouldSyncAsaas =
            forceAsaasSync ||
            tick === 1 ||
            (knownCharge ? tick % 3 === 0 : tick % 6 === 0);

          if (!shouldSyncAsaas) {
            return false;
          }

          const status = await api<CardCheckoutStatusResponse>(
            buildCardStatusPath(knownCharge, true),
            {},
            { skipSync: true },
          );

          const subscribedAt =
            status.subscribedAt ?? lite?.subscribedAt ?? null;
          const isActive =
            status.activated ||
            status.status === "ACTIVE" ||
            lite?.status === "ACTIVE";

          if (isActive) {
            setPolling(false);
            setPollHint("");
            onActivatedRef.current?.(subscribedAt, "CREDIT_CARD");
            return true;
          }

          if (status.pending?.chargeId) {
            onCheckoutResolvedRef.current?.({
              amount: status.pending.amount,
              chargeId: status.pending.chargeId,
              subscriptionId: status.pending.subscriptionId,
              paymentMethod: "CREDIT_CARD",
              cardAuthorized: true,
              activated: false,
            });
          }
          return false;
        }

        const authorizing =
          chargeId === CARD_AUTHORIZE_PENDING_CHARGE || !chargeId?.trim();

        const requestRefresh = (body: Record<string, string>) =>
          api<{
            status: string;
            activated: boolean;
            subscribedAt?: string | null;
          }>(
            "/me/subscription/refresh",
            {
              method: "POST",
              body: JSON.stringify(body),
            },
            { skipSync: true },
          );

        const buildBody = (opts?: {
          withCharge?: boolean;
          withSubscription?: boolean;
        }) => {
          const body: Record<string, string> = {};
          if (
            opts?.withCharge !== false &&
            chargeId &&
            chargeId !== CARD_AUTHORIZE_PENDING_CHARGE
          ) {
            body.chargeId = chargeId;
          }
          if (opts?.withSubscription !== false && subscriptionId) {
            body.subscriptionId = subscriptionId;
          }
          return body;
        };

        let refreshed = authorizing
          ? await requestRefresh({})
          : await requestRefresh(buildBody());

        if (
          !refreshed.activated &&
          refreshed.status !== "ACTIVE" &&
          !authorizing &&
          (chargeId || subscriptionId)
        ) {
          refreshed = await requestRefresh({});
        }

        if (refreshed.activated || refreshed.status === "ACTIVE") {
          setPolling(false);
          setPollHint("");
          onActivatedRef.current?.(
            refreshed.subscribedAt ?? null,
            paymentMethod,
          );
          return true;
        }
      } catch {
        /* falha transitória — próximo poll tenta de novo */
      } finally {
        inFlightRef.current = false;
        setCheckInFlight(false);
      }
      return false;
    },
    [api, checkout?.chargeId, checkout?.paymentMethod, checkout?.subscriptionId],
  );

  useEffect(() => {
    if (!polling) {
      return;
    }
    const hasTarget =
      checkout?.paymentMethod === "CREDIT_CARD" ||
      checkout?.subscriptionId ||
      (checkout?.chargeId &&
        checkout.chargeId !== CARD_AUTHORIZE_PENDING_CHARGE) ||
      checkout?.chargeId === CARD_AUTHORIZE_PENDING_CHARGE;
    if (!hasTarget) {
      return;
    }

    pollStartedAt.current ??= Date.now();
    pollTickRef.current = 0;

    const run = () => {
      if (inFlightRef.current) return;
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
      if (document.visibilityState === "visible" && !inFlightRef.current) {
        void checkActivation(true);
      }
    };

    void checkActivation(true);
    const id = window.setInterval(run, PAYMENT_POLL_FAST_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [
    checkout?.chargeId,
    checkout?.paymentMethod,
    checkout?.subscriptionId,
    polling,
    checkActivation,
  ]);

  function startPolling() {
    setPolling(true);
    pollStartedAt.current = Date.now();
    pollTickRef.current = 0;
    setPollHint("");
  }

  function stopPolling() {
    setPolling(false);
    setPollHint("");
    pollStartedAt.current = null;
    pollTickRef.current = 0;
  }

  async function verifyPayment() {
    setRefreshing(true);
    try {
      const ok = await checkActivation(true);
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
