"use client";

import Link from "next/link";
import type { SubscriptionPaymentMethod, SubscriptionStatus } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { PaymentMethodCards } from "@/components/payment-method-cards";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";
import {
  canChooseSubscriptionPaymentMethod,
  normalizeSubscriptionPaymentMethod,
} from "@/lib/profile-options";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { CancelSubscriptionButton } from "@/components/cancel-subscription-button";

type Props = {
  subscription: SubscriptionStatus | null;
  paymentMethod: SubscriptionPaymentMethod;
  onPaymentMethodChange?: (method: SubscriptionPaymentMethod) => void;
  onSubscriptionChange?: () => void;
};

function formatAsaasDueDateBr(isoDate: string | null | undefined): string | null {
  if (!isoDate?.trim()) return null;
  const parts = isoDate.trim().slice(0, 10).split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;
  const parsed = new Date(y, m - 1, d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ConfigPaymentSection({
  subscription,
  paymentMethod,
  onPaymentMethodChange,
  onSubscriptionChange,
}: Props) {
  const status = subscription?.status ?? "TRIAL";
  const subscriptionActive = status === "ACTIVE";
  const canChoosePayment = canChooseSubscriptionPaymentMethod(status);
  const activePaymentMethod = normalizeSubscriptionPaymentMethod(
    subscription?.subscriptionPaymentMethod ?? paymentMethod,
  );
  const subscribedAt = subscription?.subscribedAt ?? null;
  const nextRenewal = subscriptionActive
    ? formatAsaasDueDateBr(subscription?.asaasNextDueDate)
    : null;
  const lastPaidAt = subscription?.lastPayment?.paidAt ?? null;

  return (
    <section className="space-y-5 scroll-mt-4" id="onboarding-payment">
      {subscriptionActive ? (
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 border border-emerald-500/40">
              <Check className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-emerald-300">Assinatura ativa</p>
              <p className="text-sm text-foreground font-medium mt-0.5">
                Motocopiloto Pro · Acesso completo
              </p>
              {subscribedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cliente desde{" "}
                  {new Date(subscribedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Valor mensal
              </p>
              <p className="text-base font-bold text-primary tabular-nums">
                {SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Próxima cobrança
              </p>
              <p className="text-base font-semibold text-foreground tabular-nums">
                {nextRenewal ?? "—"}
              </p>
            </div>
          </div>
          {lastPaidAt && (
            <p className="text-xs text-center text-muted-foreground">
              Último pagamento confirmado em{" "}
              {new Date(lastPaidAt).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      ) : status === "PAUSED" ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
          <p className="text-sm font-medium text-amber-100">Pagamento em atraso</p>
          <p className="text-xs text-muted-foreground">
            Escolha Pix ou cartão e conclua em Assinar para liberar o acesso.
          </p>
        </div>
      ) : status === "TRIAL" ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Período de trial
          </p>
          {subscription?.trialEndsAt && (
            <p className="text-xs text-muted-foreground">
              Grátis até{" "}
              {new Date(subscription.trialEndsAt).toLocaleDateString("pt-BR")}. Depois,{" "}
              {SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              /mês.
            </p>
          )}
        </div>
      ) : null}

      {!subscriptionActive && (
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
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4" strokeWidth={1.75} />
          {subscriptionActive ? "Cobrança atual" : "Forma de pagamento"}
        </h2>
        <PaymentMethodCards
          selected={paymentMethod}
          onSelect={canChoosePayment ? onPaymentMethodChange : undefined}
          activeMethod={activePaymentMethod}
          subscriptionActive={subscriptionActive}
          subscriptionStatus={status}
          subscribedAt={subscribedAt}
          readOnly={!canChoosePayment}
          hideActiveBadge
        />
        {canChoosePayment && (
          <p className="text-xs text-muted-foreground">
            Pix ou cartão de crédito via Asaas. A escolha vale para novos cadastros,
            trial e quem está em atraso. Conclua o pagamento em Assinar.
          </p>
        )}
      </div>

      <div className="space-y-2 pt-1">
        {subscriptionActive ? (
          <>
            <Button size="lg" className="w-full" asChild>
              <Link href="/assinar">Gerenciar próximo pagamento</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Veja Pix, histórico da cobrança e detalhes da renovação mensal.
            </p>
            <CancelSubscriptionButton onCanceled={onSubscriptionChange} />
          </>
        ) : (
          <>
            <Button size="lg" className="w-full" asChild>
              <Link href="/assinar">Assinar Motocopiloto Pro</Link>
            </Button>
            {subscription?.lastPayment?.status === "PENDING" && (
              <p className="text-xs text-center text-amber-500/90">
                Há um pagamento pendente de{" "}
                {formatBRL(subscription.lastPayment.amount)} — conclua em Assinar.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
