"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SubscriptionPaymentMethod } from "@motoboy/types";
import { PaymentMethodCards } from "@/components/payment-method-cards";
import {
  canChooseSubscriptionPaymentMethod,
  normalizeSubscriptionPaymentMethod,
  type SubscriptionBillingStatus,
} from "@/lib/profile-options";
import { useApi } from "@/hooks/use-api";
import { PixSubscriptionCheckout } from "@/components/subscription-checkout/pix-subscription-checkout";
import { CardSubscriptionCheckout } from "@/components/subscription-checkout/card-subscription-checkout";
import type { PaymentActivatedHandler } from "@/components/subscription-checkout/use-payment-activation-poll";

type Props = {
  initialMethod: SubscriptionPaymentMethod;
  asaasConfigured: boolean;
  asaasStatusUnknown?: boolean;
  onActivated?: PaymentActivatedHandler;
  subscriptionActive?: boolean;
  subscriptionRefreshing?: boolean;
  subscriptionStatus?: SubscriptionBillingStatus | string | null;
  activePaymentMethod?: SubscriptionPaymentMethod | null;
  subscribedAt?: string | null;
};

export function AsaasTransparentCheckout({
  initialMethod,
  asaasConfigured,
  asaasStatusUnknown = false,
  onActivated,
  subscriptionActive = false,
  subscriptionRefreshing = false,
  subscriptionStatus = "TRIAL",
  activePaymentMethod,
  subscribedAt,
}: Props) {
  const api = useApi();
  const canChoose = canChooseSubscriptionPaymentMethod(subscriptionStatus);
  const userPickedMethod = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>(
    () => normalizeSubscriptionPaymentMethod(initialMethod),
  );

  useEffect(() => {
    if (userPickedMethod.current) return;
    setPaymentMethod(normalizeSubscriptionPaymentMethod(initialMethod));
  }, [initialMethod]);

  async function persistPaymentPreference(method: SubscriptionPaymentMethod) {
    try {
      await api(
        "/me/profile",
        {
          method: "PUT",
          body: JSON.stringify({ subscriptionPaymentMethod: method }),
        },
        { skipSync: true },
      );
    } catch {
      /* preferência local vale; painel Pix/cartão é independente */
    }
  }

  function handleSelectMethod(method: SubscriptionPaymentMethod) {
    userPickedMethod.current = true;
    setPaymentMethod(method);
    void persistPaymentPreference(method);
  }

  const panelProps = {
    asaasConfigured,
    asaasStatusUnknown,
    subscriptionActive,
    subscriptionRefreshing,
    onActivated,
  };

  return (
    <div className="space-y-4">
      {subscriptionStatus === "PAUSED" && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          Pagamento em atraso. Escolha Pix ou cartão e conclua abaixo.
        </div>
      )}

      <PaymentMethodCards
        selected={paymentMethod}
        onSelect={canChoose ? handleSelectMethod : undefined}
        activeMethod={activePaymentMethod}
        subscriptionActive={subscriptionActive}
        subscriptionStatus={subscriptionStatus}
        subscribedAt={subscribedAt}
        readOnly={!canChoose}
        disabled={false}
      />

      {paymentMethod === "PIX" ? (
        <PixSubscriptionCheckout key="checkout-pix" {...panelProps} />
      ) : (
        <CardSubscriptionCheckout key="checkout-card" {...panelProps} />
      )}

      {subscriptionStatus === "CANCELED" && !subscriptionActive && (
        <p className="text-xs text-center text-muted-foreground">
          Conta cancelada anteriormente — você pode assinar de novo com Pix ou cartão.
        </p>
      )}

      {canChoose && (
        <p className="text-xs text-center text-muted-foreground">
          Prefere alterar depois?{" "}
          <Link href="/config?tab=pagamento" className="text-primary underline">
            Configurações → Pagamento
          </Link>
        </p>
      )}
    </div>
  );
}
