"use client";

import Link from "next/link";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { SubscriptionPaymentMethod } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { subscriptionPaymentLabel } from "@/lib/profile-options";
import { PixSubscriptionCheckout } from "./pix-subscription-checkout";
import type { PaymentActivatedHandler } from "./use-payment-activation-poll";

type Props = {
  paymentMethod: SubscriptionPaymentMethod;
  subscribedAt?: string | null;
  asaasNextDueDate?: string | null;
  subscriptionRefreshing?: boolean;
  asaasConfigured: boolean;
  asaasStatusUnknown?: boolean;
  onActivated?: PaymentActivatedHandler;
};

function formatDueDateBr(isoDate: string | null | undefined): string | null {
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

export function ActiveSubscriptionManage({
  paymentMethod,
  subscribedAt,
  asaasNextDueDate,
  subscriptionRefreshing = false,
  asaasConfigured,
  asaasStatusUnknown = false,
  onActivated,
}: Props) {
  const nextRenewal = formatDueDateBr(asaasNextDueDate);
  const methodLabel = subscriptionPaymentLabel(paymentMethod);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 border border-emerald-500/40">
            <Check className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-emerald-300">Assinatura ativa</p>
            <p className="text-sm text-foreground font-medium mt-0.5">
              Cobrança via {methodLabel}
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
            <p className="text-base font-semibold text-foreground tabular-nums inline-flex items-center justify-center gap-1.5 min-h-[1.5rem]">
              {subscriptionRefreshing && !nextRenewal ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                nextRenewal ?? "—"
              )}
            </p>
          </div>
        </div>

        {subscriptionRefreshing && (
          <p className="text-xs text-center text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Sincronizando com o Asaas…
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground">
          As renovações são automáticas no dia da cobrança. Não é necessário gerar
          um novo Pix manualmente.
        </p>
      </div>

      {paymentMethod === "PIX" ? (
        <PixSubscriptionCheckout
          asaasConfigured={asaasConfigured}
          asaasStatusUnknown={asaasStatusUnknown}
          subscriptionActive
          subscriptionRefreshing={subscriptionRefreshing}
          hideActiveBanner
          onActivated={onActivated}
        />
      ) : (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-1">
          <p className="text-sm font-medium text-emerald-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Cartão cadastrado
          </p>
          <p className="text-xs text-muted-foreground">
            A cobrança mensal será feita automaticamente no cartão salvo no Asaas.
          </p>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        <Link href="/config?tab=pagamento" className="text-primary underline">
          Voltar para Configurações → Pagamento
        </Link>
      </p>
    </div>
  );
}
