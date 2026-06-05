"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import type {
  SubscribeResponse,
  SubscriptionPaymentMethod,
  UserProfile,
} from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { formatBillingCheckoutError } from "@/lib/billing-checkout-errors";
import {
  clearCardCheckoutSession,
  readCardCheckoutSession,
  writeCardCheckoutSession,
} from "@/lib/card-checkout-session";
import {
  CARD_AUTHORIZE_PENDING_CHARGE,
  requestSubscribeWithRetry,
} from "./shared";
import {
  CardCheckoutFields,
  buildDefaultCardForm,
  cardFormToPayload,
  cardValidationHint,
  isCardFormValid,
  type CardCheckoutForm,
} from "./card-checkout-fields";
import {
  usePaymentActivationPoll,
  type PaymentActivatedHandler,
} from "./use-payment-activation-poll";
import { VerifyPaymentButton } from "./verify-payment-button";

type PendingCardResponse =
  | { pending: false }
  | {
      pending: true;
      chargeId: string;
      amount?: number;
      subscriptionId?: string;
      cardAuthorized: true;
      activated?: boolean;
    };

type Props = {
  asaasConfigured: boolean;
  asaasStatusUnknown?: boolean;
  subscriptionActive?: boolean;
  onActivated?: PaymentActivatedHandler;
  /** Perfil pré-carregado no pai — formulário aparece sem esperar GET /me/profile. */
  profile?: UserProfile | null;
};

export function CardSubscriptionCheckout({
  asaasConfigured,
  asaasStatusUnknown = false,
  subscriptionActive = false,
  onActivated,
  profile = null,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [form, setForm] = useState<CardCheckoutForm>(buildDefaultCardForm(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const [justActivated, setJustActivated] = useState(false);
  const formHydrated = useRef(false);
  const autoResumeDone = useRef(false);
  const stopPollingRef = useRef<() => void>(() => {});

  const onPaymentActivated = useCallback(
    (
      subscribedAt?: string | null,
      paymentMethod?: SubscriptionPaymentMethod,
    ) => {
      clearCardCheckoutSession();
      setCheckout(null);
      setJustActivated(true);
      stopPollingRef.current();
      onActivated?.(subscribedAt, paymentMethod ?? "CREDIT_CARD");
    },
    [onActivated],
  );

  const showCardCheckoutRef = useRef<(data: SubscribeResponse) => void>(() => {});

  const {
    polling,
    pollHint,
    refreshing,
    checkInFlight,
    startPolling,
    stopPolling,
    verifyPayment,
  } = usePaymentActivationPoll(checkout, onPaymentActivated, {
    onCheckoutResolved: (data) => {
      if (data.chargeId === CARD_AUTHORIZE_PENDING_CHARGE) return;
      showCardCheckoutRef.current(data);
    },
  });

  stopPollingRef.current = stopPolling;

  useEffect(() => {
    if (!subscriptionActive) return;
    setJustActivated(false);
    clearCardCheckoutSession();
    stopPolling();
  }, [subscriptionActive, stopPolling]);

  useEffect(() => {
    if (!profile || formHydrated.current) return;
    setForm(buildDefaultCardForm(profile));
    formHydrated.current = true;
  }, [profile]);

  const checkoutBlocked = !asaasConfigured && !asaasStatusUnknown;
  const formReady = isCardFormValid(form);

  const showCardCheckout = useCallback(
    (data: SubscribeResponse) => {
      setCheckout(data);
      if (data.chargeId) {
        writeCardCheckoutSession({
          chargeId: data.chargeId,
          amount: data.amount,
          subscriptionId: data.subscriptionId,
          updatedAt: Date.now(),
        });
      }
      startPolling();
    },
    [startPolling],
  );

  showCardCheckoutRef.current = showCardCheckout;

  const fetchPendingCard = useCallback(async (): Promise<PendingCardResponse | null> => {
    try {
      const pending = await api<PendingCardResponse>(
        "/me/subscribe/card/pending",
        {},
        { skipSync: true },
      );
      if (pending.pending && pending.chargeId) return pending;
    } catch {
      /* sessão */
    }
    const saved = readCardCheckoutSession();
    if (!saved?.chargeId) return null;
    return {
      pending: true,
      chargeId: saved.chargeId,
      amount: saved.amount,
      subscriptionId: saved.subscriptionId,
      cardAuthorized: true,
    };
  }, [api]);

  useEffect(() => {
    if (
      autoResumeDone.current ||
      subscriptionActive ||
      sessionStatus !== "authenticated"
    ) {
      return;
    }
    autoResumeDone.current = true;

    void (async () => {
      const pending = await fetchPendingCard();
      if (!pending?.pending || !pending.chargeId) return;
      if (pending.activated) {
        onPaymentActivated(new Date().toISOString(), "CREDIT_CARD");
        return;
      }
      showCardCheckout({
        amount: pending.amount ?? 0,
        chargeId: pending.chargeId,
        paymentMethod: "CREDIT_CARD",
        subscriptionId: pending.subscriptionId,
        cardAuthorized: true,
        activated: false,
      });
    })();
  }, [
    fetchPendingCard,
    onPaymentActivated,
    sessionStatus,
    showCardCheckout,
    subscriptionActive,
  ]);

  async function subscribeWithCard() {
    if (subscriptionActive) {
      setError("Você já tem assinatura ativa.");
      return;
    }
    if (sessionStatus !== "authenticated") {
      setError("Aguarde o login ou entre de novo.");
      return;
    }
    if (!formReady) {
      setError(cardValidationHint());
      return;
    }

    setLoading(true);
    setError("");
    stopPolling();
    setCheckout({
      amount: SUBSCRIPTION_PRICE_BRL,
      chargeId: CARD_AUTHORIZE_PENDING_CHARGE,
      paymentMethod: "CREDIT_CARD",
      cardAuthorized: true,
      activated: false,
    });
    startPolling();

    const payload = cardFormToPayload(form);

    void requestSubscribeWithRetry(api, {
      paymentMethod: "CREDIT_CARD",
      ...payload,
    })
      .then((data) => {
        if (data.activated) {
          onPaymentActivated(
            new Date().toISOString(),
            "CREDIT_CARD",
          );
          return;
        }
        if (data.paymentMethod !== "CREDIT_CARD") {
          stopPolling();
          setCheckout(null);
          setError("Resposta inválida do servidor. Tente o cartão novamente.");
          return;
        }
        if (data.cardAuthorized) {
          showCardCheckout(data);
        }
      })
      .catch(async (e) => {
        const err = e as Error & { status?: number; code?: string };
        const timedOut =
          err.status === 504 ||
          /demorou|timeout|aborted/i.test(err.message ?? "");

        const pending = await fetchPendingCard();
        if (pending?.pending && pending.chargeId) {
          if (pending.activated) {
            onPaymentActivated(new Date().toISOString(), "CREDIT_CARD");
            return;
          }
          showCardCheckout({
            amount: pending.amount ?? 0,
            chargeId: pending.chargeId,
            paymentMethod: "CREDIT_CARD",
            subscriptionId: pending.subscriptionId,
            cardAuthorized: true,
            activated: false,
          });
          return;
        }

        if (timedOut) {
          setError("");
          return;
        }

        let msg = formatBillingCheckoutError(
          err.message || "Erro ao processar cartão",
          err.code,
          err.status,
        );
        if (err.status === 409) {
          msg =
            "Há uma cobrança de cartão em processamento. Aguarde 1 minuto e tente de novo.";
        }
        stopPolling();
        setCheckout(null);
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function abandonCardCheckout() {
    setCheckout(null);
    clearCardCheckoutSession();
    stopPolling();
    try {
      await api(
        "/me/subscribe/card/abandon",
        { method: "POST" },
        { skipSync: true },
      );
    } catch {
      /* local já limpo */
    }
  }

  if (justActivated) {
    return (
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 border border-emerald-500/40">
            <Check className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-emerald-300">Assinatura ativa</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cobrança via cartão confirmada. Carregando detalhes…
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-100">
          <Loader2 className="h-4 w-4 animate-spin" />
          Liberando seu acesso Pro…
        </div>
      </div>
    );
  }

  const authorizingCard =
    checkout?.chargeId === CARD_AUTHORIZE_PENDING_CHARGE;

  if (
    checkout?.paymentMethod === "CREDIT_CARD" &&
    checkout.cardAuthorized
  ) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-300 flex items-center gap-2">
            {polling || checkInFlight || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {authorizingCard || loading
              ? "Validando cartão no Asaas…"
              : "Cartão validado no Asaas"}
          </p>
          <p className="text-xs text-muted-foreground">
            {authorizingCard || loading
              ? "Não feche esta tela — estamos confirmando com o banco em tempo real."
              : polling || checkInFlight
                ? "Confirmando a primeira cobrança em tempo real…"
                : "Use o botão abaixo se o acesso não liberar sozinho."}
          </p>
        </div>
        {(polling || checkInFlight) && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
            <p className="text-sm font-medium text-emerald-100">
              Verificando pagamento do cartão…
            </p>
            <p className="text-xs text-muted-foreground">
              Assim que a cobrança for confirmada, sua assinatura ativa na hora.
            </p>
          </div>
        )}
        {pollHint && (
          <p className="text-xs text-center text-amber-500/90">{pollHint}</p>
        )}
        <VerifyPaymentButton
          refreshing={refreshing}
          onClick={() => void verifyPayment()}
        />
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={() => void abandonCardCheckout()}
        >
          Voltar
        </Button>
      </div>
    );
  }

  if (subscriptionActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      <CardCheckoutFields
        form={form}
        onChange={setForm}
        disabled={loading}
      />

      {!subscriptionActive && (
        <>
          <Button
            size="lg"
            className="w-full"
            disabled={loading || checkoutBlocked}
            onClick={() => void subscribeWithCard()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validando cartão no Asaas…
              </>
            ) : (
              "Assinar com cartão"
            )}
          </Button>
          {!formReady && !loading && (
            <p className="text-xs text-center text-amber-500/90">
              {cardValidationHint()}
            </p>
          )}
        </>
      )}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
