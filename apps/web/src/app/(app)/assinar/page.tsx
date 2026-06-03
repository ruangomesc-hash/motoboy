"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Check, Eye } from "lucide-react";
import type { SubscriptionStatus } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { AppPage } from "@/components/app-page";
import { AppLoadingSplash } from "@/components/app-loading-splash";
import { AsaasTransparentCheckout } from "@/components/asaas-transparent-checkout";
import { Button } from "@/components/ui/button";
import { normalizeSubscriptionPaymentMethod } from "@/lib/profile-options";

function isCheckoutPreview(searchParams: URLSearchParams): boolean {
  const p = searchParams.get("preview");
  return p === "checkout" || p === "1" || searchParams.get("visualizar") === "1";
}

function AssinarPageContent() {
  const api = useApi();
  const searchParams = useSearchParams();
  const previewCheckout = isCheckoutPreview(searchParams);
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

  const isActive = subStatus?.status === "ACTIVE";

  if (isActive && !previewCheckout) {
    return (
      <AppPage className="p-6 flex flex-col flex-1 justify-center gap-4 text-center">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <Check className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold">Assinatura ativa</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Você já é assinante Motocopiloto Pro.
          </p>
          {subStatus.subscribedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Desde{" "}
              {new Date(subStatus.subscribedAt).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/assinar?preview=checkout">
            <Eye className="h-4 w-4 mr-2" />
            Ver layout do checkout
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Só visualização — não gera nova cobrança.
        </p>
      </AppPage>
    );
  }

  const asaasOk = subStatus?.asaas?.configured ?? false;
  const preferredMethod = normalizeSubscriptionPaymentMethod(
    subStatus?.subscriptionPaymentMethod,
  );

  return (
    <AppPage className="p-6 flex flex-col flex-1 gap-6">
      {isActive && previewCheckout && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-center space-y-2">
          <p>
            <strong className="text-foreground">Modo visualização</strong> — sua
            assinatura já está ativa. O layout abaixo é como novos assinantes
            veem o pagamento.
          </p>
          <Link
            href="/assinar"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            Voltar ao resumo da assinatura
          </Link>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-bold">Motocopiloto Pro</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {isActive && previewCheckout
            ? "Prévia da tela de pagamento"
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
        onActivated={previewCheckout ? undefined : refresh}
        previewOnly={isActive && previewCheckout}
      />

      {!asaasOk && !previewCheckout && (
        <p className="text-xs text-center text-amber-500/90">
          Pagamento ainda não configurado no servidor (ASAAS_API_KEY).
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        {previewCheckout
          ? "Para testar cobrança real, use uma conta em trial ou sem assinatura ativa."
          : "Pix via Asaas nesta tela. A preferência em Configurações é aplicada ao gerar o pagamento."}
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
