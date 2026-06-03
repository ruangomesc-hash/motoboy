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
import { normalizeSubscriptionPaymentMethod } from "@/lib/profile-options";
import { PaymentMethodCards } from "@/components/payment-method-cards";
import { useSession } from "next-auth/react";

type Props = {
  initialMethod: SubscriptionPaymentMethod;
  asaasConfigured: boolean;
  onActivated?: () => void;
  subscriptionActive?: boolean;
  activePaymentMethod?: SubscriptionPaymentMethod | null;
  subscribedAt?: string | null;
};

export function AsaasTransparentCheckout({
  initialMethod,
  asaasConfigured,
  onActivated,
  subscriptionActive = false,
  activePaymentMethod,
  subscribedAt,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const paymentMethod = "PIX" as const;
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
    if (!checkout || !polling) return;
    const id = window.setInterval(() => void pollStatus(), 4000);
    return () => window.clearInterval(id);
  }, [checkout, polling, pollStatus]);

  async function startCheckout() {
    if (subscriptionActive) {
      setError("Você já tem assinatura ativa.");
      return;
    }
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
        body: JSON.stringify({ paymentMethod: "PIX" }),
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
        {checkout.pixCopyPaste && (
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
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Forma de pagamento</p>
        <PaymentMethodCards
          selected={normalizeSubscriptionPaymentMethod(initialMethod)}
          activeMethod={activePaymentMethod}
          subscriptionActive={subscriptionActive}
          subscribedAt={subscribedAt}
          readOnly={subscriptionActive}
          disabled={!asaasConfigured}
        />
      </div>

      {!subscriptionActive && (
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
            "Assinar por R$ 15,90/mês"
          )}
        </Button>
      )}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
