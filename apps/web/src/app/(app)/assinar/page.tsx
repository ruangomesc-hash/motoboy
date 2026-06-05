"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import {
  SUBSCRIPTION_PRICE_BRL,
  type SubscriptionPaymentMethod,
} from "@motoboy/types";
import { AppPage } from "@/components/app-page";
import { AppLoadingSplash } from "@/components/app-loading-splash";
import { AsaasTransparentCheckout } from "@/components/asaas-transparent-checkout";
import { normalizeSubscriptionPaymentMethod } from "@/lib/profile-options";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { billingAsaasNotice } from "@/lib/billing-messages";

function AssinarPageContent() {
  const { status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const manageMode = searchParams.get("gerenciar") === "1";
  const {
    subscription,
    loadState,
    refreshing,
    asaasConfigured,
    refresh,
    applyActiveStatus,
  } = useBillingStatus(sessionStatus === "authenticated");

  const billingSyncDone = useRef(false);
  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (billingSyncDone.current) return;
    if (subscription?.status !== "ACTIVE" && !manageMode) return;
    billingSyncDone.current = true;
    refresh({ silent: true, syncBilling: true });
  }, [manageMode, refresh, sessionStatus, subscription?.status]);

  if (sessionStatus === "loading") {
    return (
      <AppPage className="p-6 flex flex-col flex-1 min-h-[50vh]">
        <AppLoadingSplash variant="account" className="flex-1" />
      </AppPage>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <AppPage className="p-6 flex flex-col flex-1 justify-center text-center gap-3">
        <p className="text-sm text-muted-foreground">
          Faça login para assinar o Motocopiloto Pro.
        </p>
      </AppPage>
    );
  }

  const status = subscription?.status ?? "TRIAL";
  const isActive = status === "ACTIVE";

  /** Em ?gerenciar=1 não exibir checkout Pix/cartão até confirmar assinatura ACTIVE. */
  const manageAwaitingActive =
    manageMode &&
    !isActive &&
    (loadState === "loading" || refreshing || !subscription);

  if (
    (loadState === "loading" && !subscription) ||
    manageAwaitingActive
  ) {
    return (
      <AppPage className="p-6 flex flex-col flex-1 min-h-[50vh]">
        {manageMode && (
          <p className="text-center text-sm text-muted-foreground mb-2">
            Carregando detalhes da sua assinatura…
          </p>
        )}
        <AppLoadingSplash variant="account" className="flex-1" />
      </AppPage>
    );
  }

  if (manageMode && !isActive) {
    return (
      <AppPage className="p-6 flex flex-col flex-1 justify-center text-center gap-3">
        <p className="text-sm text-muted-foreground">
          Não encontramos uma assinatura ativa para gerenciar.
        </p>
        <p className="text-xs text-muted-foreground">
          <a href="/config?tab=pagamento" className="text-primary underline">
            Voltar para Configurações → Pagamento
          </a>
        </p>
      </AppPage>
    );
  }
  const asaasOk = asaasConfigured === true;
  const asaasNotice = billingAsaasNotice(loadState, asaasConfigured, isActive);
  const preferredMethod = normalizeSubscriptionPaymentMethod(
    subscription?.subscriptionPaymentMethod,
  );

  function handleActivated(
    subscribedAt?: string | null,
    paymentMethod?: SubscriptionPaymentMethod,
  ) {
    applyActiveStatus(subscribedAt, paymentMethod);
    refresh({ silent: true, fast: true });
  }

  return (
    <AppPage className="p-6 flex flex-col flex-1 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isActive ? "Sua assinatura" : "Motocopiloto Pro"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {refreshing && !isActive ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Carregando status da assinatura…
            </span>
          ) : isActive ? (
            "Renovação automática · detalhes da cobrança"
          ) : status === "PAUSED" ? (
            "Regularize o pagamento para liberar o acesso:"
          ) : (
            "Trial de 4 dias grátis. Depois, continue por:"
          )}
        </p>
        <p className="text-4xl font-bold text-primary mt-3">
          {SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-sm text-muted-foreground">/mês · Acesso completo</p>
      </div>

      {!isActive && (
        <ul className="text-left text-sm space-y-2 text-muted-foreground">
          {[
            "Registro por WhatsApp (áudio, texto, foto)",
            "Lucro líquido em tempo real",
            "Roteirizador com Google Maps",
            "Metas e estatísticas",
          ].map((text) => (
            <li key={text} className="flex items-start gap-2">
              <Check
                className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5"
                strokeWidth={2}
              />
              {text}
            </li>
          ))}
        </ul>
      )}

      <AsaasTransparentCheckout
        initialMethod={preferredMethod}
        asaasConfigured={asaasOk}
        asaasStatusUnknown={
          loadState !== "ready" || asaasConfigured === null
        }
        onActivated={handleActivated}
        subscriptionActive={isActive}
        subscriptionStatus={status}
        subscriptionRefreshing={refreshing}
        activePaymentMethod={preferredMethod}
        subscribedAt={subscription?.subscribedAt ?? null}
        asaasNextDueDate={subscription?.asaasNextDueDate ?? null}
      />

      {asaasNotice && loadState !== "loading" && (
        <p className="text-xs text-center text-amber-500/90">{asaasNotice}</p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Pagamento mensal via Pix ou cartão (Asaas).
      </p>
    </AppPage>
  );
}

export default function AssinarPage() {
  return (
    <Suspense
      fallback={
        <AppPage className="p-6 flex flex-col flex-1 min-h-[50vh]">
          <AppLoadingSplash variant="account" className="flex-1" />
        </AppPage>
      }
    >
      <AssinarPageContent />
    </Suspense>
  );
}
