"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import type { SubscribeResponse, SubscriptionStatus } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { AppPage } from "@/components/app-page";

export default function AssinarPage() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    api<SubscriptionStatus>("/me/subscription")
      .then(setSubStatus)
      .catch(() => setSubStatus(null));
  }, [api]);

  async function goToCheckout() {
    setLoading(true);
    setError("");
    try {
      const data = await api<SubscribeResponse>("/me/subscribe", {
        method: "POST",
      });
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao abrir pagamento");
      setLoading(false);
    }
  }

  if (subStatus?.status === "ACTIVE") {
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
      </AppPage>
    );
  }

  const checkoutBase =
    subStatus?.cartpanda?.checkoutUrl ?? "https://assinatura.motocopiloto.com.br";

  return (
    <AppPage className="p-6 flex flex-col flex-1 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Motocopiloto Pro</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Trial de 4 dias grátis. Depois, continue por:
        </p>
        <p className="text-4xl font-bold text-primary mt-3">
          {SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-sm text-muted-foreground">/mês · Pix ou cartão</p>
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

      <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">No checkout, use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>O mesmo WhatsApp do seu cadastro</li>
          <li>O mesmo e-mail do seu cadastro</li>
        </ul>
        <p className="text-xs">
          Assim sua conta ativa automaticamente após o pagamento.
        </p>
      </div>

      <Button
        size="lg"
        onClick={goToCheckout}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Abrindo pagamento..." : "Ir para pagamento"}
        {!loading && <ExternalLink className="h-4 w-4 ml-2" />}
      </Button>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Pagamento em{" "}
        <a
          href={checkoutBase}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          assinatura.motocopiloto.com.br
        </a>
        . Após pagar, o app libera em instantes.
      </p>
    </AppPage>
  );
}
