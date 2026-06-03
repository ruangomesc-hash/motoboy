"use client";

import Link from "next/link";
import type { SubscriptionPaymentMethod } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { PaymentMethodCards } from "@/components/payment-method-cards";
import { CreditCard } from "lucide-react";

type Props = {
  paymentMethod: SubscriptionPaymentMethod;
  onPaymentMethodChange: (method: SubscriptionPaymentMethod) => void;
  subscriptionActive?: boolean;
  subscriptionPaymentMethod?: SubscriptionPaymentMethod | null;
  subscribedAt?: string | null;
};

export function ConfigPaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  subscriptionActive = false,
  subscriptionPaymentMethod,
  subscribedAt,
}: Props) {
  return (
    <section className="space-y-4 scroll-mt-4" id="onboarding-payment">
      <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4" strokeWidth={1.75} />
        Assinatura Motocopiloto Pro
      </h2>

      <div className="rounded-xl border border-border bg-card p-4 space-y-1 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Acesso completo
        </p>
        <p className="text-3xl font-bold text-primary">
          {SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-sm text-muted-foreground">/mês</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Forma de pagamento</p>
        <PaymentMethodCards
          selected={paymentMethod}
          onSelect={onPaymentMethodChange}
          activeMethod={subscriptionPaymentMethod}
          subscriptionActive={subscriptionActive}
          subscribedAt={subscribedAt}
          readOnly={subscriptionActive}
        />
        <p className="text-xs text-muted-foreground">
          R$ 15,90/mês · Pix automático via Asaas.
          {!subscriptionActive && (
            <>
              {" "}
              Para pagar agora, abra{" "}
              <Link
                href="/assinar"
                className="text-primary underline-offset-2 hover:underline"
              >
                Assinar
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </section>
  );
}
