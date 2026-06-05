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
  const onActivatedRef = useRef(onActivated);
  const onCheckoutResolvedRef = useRef(options?.onCheckoutResolved);
  onActivatedRef.current = onActivated;
  onCheckoutResolvedRef.current = options?.onCheckoutResolved;

  const checkActivation = useCallback(async (): Promise<boolean> => {
    const chargeId = checkout?.chargeId;
    const subscriptionId = checkout?.subscriptionId;
    const paymentMethod = checkout?.paymentMethod;
    setCheckInFlight(true);
    try {
      if (paymentMethod === "CREDIT_CARD") {
        const [lite, status] = await Promise.all([
          api<LiteSubscriptionStatus>(
            "/me/subscription?lite=1",
            {},
            { skipSync: true },
          ).catch(() => null),
          api<CardCheckoutStatusResponse>(
            "/me/subscribe/card/status",
            {},
            { skipSync: true },
          ),
        ]);

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
      setCheckInFlight(false);
    }
    return false;
  }, [api, checkout?.chargeId, checkout?.paymentMethod, checkout?.subscriptionId]);

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
