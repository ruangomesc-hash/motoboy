"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2 } from "lucide-react";
import type {
  SubscribeResponse,
  SubscriptionPaymentMethod,
  SubscriptionStatus,
} from "@motoboy/types";
import {
  SUBSCRIPTION_PAYMENT_OPTIONS_UI,
  normalizeSubscriptionPaymentMethod,
} from "@/lib/profile-options";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type Props = {
  initialMethod: SubscriptionPaymentMethod;
  asaasConfigured: boolean;
  onActivated?: () => void;
};

export function AsaasTransparentCheckout({
  initialMethod,
  asaasConfigured,
  onActivated,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>(
    () => normalizeSubscriptionPaymentMethod(initialMethod),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const sub = await api<SubscriptionStatus>("/me/subscription");
      if (sub.status === "ACTIVE") {
        setPolling(false);
        onActivated?.();
      }
    } catch {
      /* ignora falha pontual */
    }
  }, [api, onActivated]);

  useEffect(() => {
    setPaymentMethod(normalizeSubscriptionPaymentMethod(initialMethod));
  }, [initialMethod]);

  useEffect(() => {
    if (!checkout || !polling) return;
    const id = window.setInterval(() => void pollStatus(), 4000);
    return () => window.clearInterval(id);
  }, [checkout, polling, pollStatus]);

  async function startCheckout() {
    if (sessionStatus !== "authenticated") {
      setError("Aguarde o login ou entre de novo.");
      return;
    }
    setLoading(true);
    setError("");
    setCheckout(null);
    try {
      const data = await api<SubscribeResponse>("/me/subscribe", {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      });
      setCheckout(data);
      setPolling(true);
      void pollStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar pagamento");
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!checkout?.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(checkout.pixCopyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar o Pix. Selecione o código abaixo.");
    }
  }

  if (checkout) {
    return (
      <div className="space-y-4">
        {paymentMethod === "PIX" && checkout.pixCopyPaste && (
          <div className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
            <p className="text-sm font-medium">Pix copia e cola</p>
            <p className="text-xs text-muted-foreground break-all font-mono leading-relaxed max-h-28 overflow-y-auto">
              {checkout.pixCopyPaste}
            </p>
            <Button type="button" variant="outline" className="w-full" onClick={copyPix}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar código Pix
                </>
              )}
            </Button>
          </div>
        )}

        {paymentMethod === "CREDIT_CARD" && (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Cartão de crédito</p>
            <p>
              Formulário de cartão (checkout transparente Asaas) será integrado aqui.
              Cobrança já criada no Asaas — ID:{" "}
              <span className="font-mono text-xs">{checkout.chargeId}</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Aguardando confirmação do pagamento…
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={() => {
            setCheckout(null);
            setPolling(false);
          }}
        >
          Escolher outra forma de pagamento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Forma de pagamento</p>
        <div className="grid gap-2">
          {SUBSCRIPTION_PAYMENT_OPTIONS_UI.map((opt) => {
            const selected = paymentMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={!asaasConfigured}
                onClick={() => setPaymentMethod(opt.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-card/50",
                  !asaasConfigured && "opacity-50 cursor-not-allowed",
                )}
              >
                <span className="font-medium text-foreground block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={loading || !asaasConfigured}
        onClick={startCheckout}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Gerando cobrança…
          </>
        ) : (
          "Gerar pagamento"
        )}
      </Button>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
