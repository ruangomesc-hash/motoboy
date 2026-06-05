"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { SubscribeResponse } from "@motoboy/types";
import { formatBillingCheckoutError } from "@/lib/billing-checkout-errors";
import {
  clearCardCheckoutSession,
  readCardCheckoutSession,
  writeCardCheckoutSession,
} from "@/lib/card-checkout-session";
import { requestSubscribeWithRetry } from "./shared";
import {
  CardCheckoutFields,
  buildDefaultCardForm,
  cardFormToPayload,
  cardValidationHint,
  isCardFormValid,
  type CardCheckoutForm,
} from "./card-checkout-fields";
import { useCheckoutProfile } from "./use-checkout-profile";
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
    };

type Props = {
  asaasConfigured: boolean;
  asaasStatusUnknown?: boolean;
  subscriptionActive?: boolean;
  onActivated?: PaymentActivatedHandler;
};

export function CardSubscriptionCheckout({
  asaasConfigured,
  asaasStatusUnknown = false,
  subscriptionActive = false,
  onActivated,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const profile = useCheckoutProfile();
  const [form, setForm] = useState<CardCheckoutForm>(buildDefaultCardForm(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const formHydrated = useRef(false);
  const autoResumeDone = useRef(false);

  const handleActivated = useCallback(
    (subscribedAt?: string | null) => {
      clearCardCheckoutSession();
      onActivated?.(subscribedAt);
    },
    [onActivated],
  );

  const {
    polling,
    pollHint,
    refreshing,
    startPolling,
    stopPolling,
    verifyPayment,
  } = usePaymentActivationPoll(checkout, handleActivated);

  useEffect(() => {
    if (!subscriptionActive) return;
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
    setCheckout(null);
    stopPolling();

    const payload = cardFormToPayload(form);

    try {
      await api(
        "/me/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            cpfCnpj: payload.cpfCnpj,
            name: payload.creditCardHolderInfo.name,
            email: payload.creditCardHolderInfo.email,
          }),
        },
        { skipSync: true },
      );

      const data = await requestSubscribeWithRetry(api, {
        paymentMethod: "CREDIT_CARD",
        ...payload,
      });

      if (data.activated) {
        handleActivated(new Date().toISOString());
        return;
      }

      if (data.paymentMethod !== "CREDIT_CARD") {
        setError("Resposta inválida do servidor. Tente o cartão novamente.");
        return;
      }

      if (data.cardAuthorized) {
        showCardCheckout(data);
        return;
      }

      setError("Não foi possível validar o cartão. Confira os dados e tente de novo.");
    } catch (e) {
      const err = e as Error & { status?: number; code?: string };
      let msg = formatBillingCheckoutError(
        err.message || "Erro ao processar cartão",
        err.code,
        err.status,
      );
      if (err.status === 409) {
        msg =
          "Há uma cobrança de cartão em processamento. Aguarde 1 minuto e tente de novo.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (
    checkout?.paymentMethod === "CREDIT_CARD" &&
    checkout.cardAuthorized
  ) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Cartão validado no Asaas.{" "}
          {polling
            ? "Aguardando confirmação da primeira cobrança…"
            : "Use o botão abaixo se o acesso não liberar sozinho."}
        </div>
        {polling && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Confirmando pagamento do cartão…
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
          onClick={() => {
            setCheckout(null);
            clearCardCheckoutSession();
            stopPolling();
          }}
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
                Processando cartão…
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
