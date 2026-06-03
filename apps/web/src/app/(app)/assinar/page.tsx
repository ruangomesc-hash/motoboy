"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Check } from "lucide-react";
import type { SubscriptionStatus } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { AppPage } from "@/components/app-page";
import { AppLoadingSplash } from "@/components/app-loading-splash";
import { AsaasTransparentCheckout } from "@/components/asaas-transparent-checkout";
import { normalizeSubscriptionPaymentMethod } from "@/lib/profile-options";

function AssinarPageContent() {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (sessionStatus !== "authenticated") return;
    setLoading(true);
    void api<SubscriptionStatus>("/me/subscription")
      .then(setSubStatus)
      .catch(() => setSubStatus(null))
      .finally(() => setLoading(false));
  }, [api, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus !== "authenticated") {
      setLoading(false);
      return;
    }
    refresh();
  }, [sessionStatus, refresh]);

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && loading)) {
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

  const status = subStatus?.status ?? "TRIAL";
  const isActive = status === "ACTIVE";
  const asaasOk = subStatus?.asaas?.configured ?? false;
  const preferredMethod = normalizeSubscriptionPaymentMethod(
    subStatus?.subscriptionPaymentMethod,
  );

  return (
    <AppPage className="p-6 flex flex-col flex-1 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Motocopiloto Pro</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {isActive
            ? "Seu acesso completo está liberado"
            : status === "PAUSED"
              ? "Regularize o pagamento para liberar o acesso:"
              : "Trial de 4 dias grátis. Depois, continue por:"}
        </p>
        <p className="text-4xl font-bold text-primary mt-3">
          {SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-sm text-muted-foreground">/mês · Acesso completo</p>
      </div>

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

      <AsaasTransparentCheckout
        initialMethod={preferredMethod}
        asaasConfigured={asaasOk}
        onActivated={refresh}
        subscriptionActive={isActive}
        subscriptionStatus={status}
        activePaymentMethod={preferredMethod}
        subscribedAt={subStatus?.subscribedAt ?? null}
      />

      {!asaasOk && !isActive && (
        <p className="text-xs text-center text-amber-500/90">
          Pagamento ainda não configurado no servidor (ASAAS_API_KEY).
        </p>
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
