"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  subscriptionPaymentLabel,
  SUBSCRIPTION_PAYMENT_OPTIONS,
} from "@/lib/profile-options";
import type {
  SubscribeResponse,
  SubscriptionPaymentMethod,
  SubscriptionStatus,
  UserProfile,
} from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { cn } from "@/lib/utils";
import { AppPage } from "@/components/app-page";

const CTA_LABEL: Record<SubscriptionPaymentMethod, string> = {
  PIX: "Gerar Pix e assinar",
  CREDIT_CARD: "Pagar com cartão",
  BOLETO: "Gerar boleto",
};

export default function AssinarPage() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<SubscriptionPaymentMethod>("PIX");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    api<{ profile: UserProfile }>("/me")
      .then((r) => setMethod(r.profile.subscriptionPaymentMethod))
      .catch(() => setMethod("PIX"));

    api<SubscriptionStatus>("/me/subscription")
      .then(setSubStatus)
      .catch(() => setSubStatus(null));
  }, [api]);

  async function subscribe() {
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      await api("/me/profile", {
        method: "PUT",
        body: JSON.stringify({ subscriptionPaymentMethod: method }),
      });
      const data = await api<SubscribeResponse>("/me/subscribe", {
        method: "POST",
      });
      setCheckout(data);
      if (data.invoiceUrl && method !== "PIX") {
        window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar cobrança");
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!checkout?.pixCopyPaste) return;
    await navigator.clipboard.writeText(checkout.pixCopyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <p className="text-sm text-muted-foreground">/mês · cobrança via Asaas</p>
      </div>

      <div className="text-left space-y-2">
        <p className="text-sm text-muted-foreground">Forma de pagamento</p>
        <div className="flex flex-wrap gap-2">
          {SUBSCRIPTION_PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              title={opt.hint}
              onClick={() => {
                setMethod(opt.id);
                setCheckout(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                method === opt.id
                  ? "bg-primary/15 border-primary text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
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

      {!checkout ? (
        <>
          <Button
            size="lg"
            onClick={subscribe}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Conectando ao Asaas..." : CTA_LABEL[method]}
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro processado por{" "}
            <a
              href="https://www.asaas.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              Asaas
            </a>
          </p>
        </>
      ) : (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-center">
            Cobrança gerada — finalize o pagamento
          </p>

          {checkout.pixCopyPaste && method === "PIX" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Pix copia e cola</p>
              <Input
                readOnly
                value={checkout.pixCopyPaste}
                className="text-xs font-mono"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={copyPix}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copiado!" : "Copiar código Pix"}
              </Button>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={() =>
              window.open(checkout.invoiceUrl, "_blank", "noopener,noreferrer")
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir página de pagamento Asaas
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            Após o pagamento, sua conta ativa em instantes (webhook Asaas).
          </p>
        </div>
      )}
    </AppPage>
  );
}
