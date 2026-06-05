"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2 } from "lucide-react";
import type { SubscribeResponse } from "@motoboy/types";
import { formatBillingCheckoutError } from "@/lib/billing-checkout-errors";
import {
  pixQrSrc,
  pollPixQrUntilReady,
  requestSubscribeWithRetry,
} from "./shared";
import {
  PixCheckoutFields,
  buildDefaultPixForm,
  isPixFormValid,
  pixFormToPayload,
  pixValidationHint,
  type PixCheckoutForm,
} from "./pix-checkout-fields";
import { useCheckoutProfile } from "./use-checkout-profile";
import { usePaymentActivationPoll } from "./use-payment-activation-poll";
import { VerifyPaymentButton } from "./verify-payment-button";

type Props = {
  asaasConfigured: boolean;
  asaasStatusUnknown?: boolean;
  subscriptionActive?: boolean;
  onActivated?: () => void;
};

export function PixSubscriptionCheckout({
  asaasConfigured,
  asaasStatusUnknown = false,
  subscriptionActive = false,
  onActivated,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const profile = useCheckoutProfile();
  const [form, setForm] = useState<PixCheckoutForm>({ cpfCnpj: "" });
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"create" | "qr">("create");
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const formHydrated = useRef(false);
  const formDirty = useRef(false);

  const {
    polling,
    pollHint,
    refreshing,
    startPolling,
    stopPolling,
    verifyPayment,
  } = usePaymentActivationPoll(checkout, onActivated);

  useEffect(() => {
    if (!profile || formHydrated.current) return;
    setForm((prev) =>
      formDirty.current || prev.cpfCnpj.replace(/\D/g, "").length > 0
        ? prev
        : buildDefaultPixForm(profile),
    );
    formHydrated.current = true;
  }, [profile]);

  const checkoutBlocked = !asaasConfigured && !asaasStatusUnknown;
  const formReady = isPixFormValid(form);

  async function generatePix() {
    if (subscriptionActive) {
      setError("Você já tem assinatura ativa.");
      return;
    }
    if (sessionStatus !== "authenticated") {
      setError("Aguarde o login ou entre de novo.");
      return;
    }
    if (!formReady) {
      setError(pixValidationHint(form) ?? "Preencha o CPF antes de continuar.");
      return;
    }

    setLoading(true);
    setLoadingPhase("create");
    setError("");
    setCheckout(null);
    stopPolling();

    try {
      const data = await requestSubscribeWithRetry(api, {
        paymentMethod: "PIX",
        ...pixFormToPayload(form),
      });

      if (data.activated) {
        onActivated?.();
        return;
      }

      if (data.paymentMethod !== "PIX") {
        setError("Resposta inválida do servidor. Tente gerar o Pix novamente.");
        return;
      }

      let checkoutData = data;

      if (
        data.pixPending ||
        (!data.pixCopyPaste && !data.pixQrCodeImage && data.chargeId)
      ) {
        setLoadingPhase("qr");
        const qr = await pollPixQrUntilReady(api, data.chargeId);
        if (!qr) {
          setError(
            "O Pix foi criado, mas o QR demorou. Aguarde alguns segundos e toque em Gerar Pix de novo.",
          );
          return;
        }
        checkoutData = {
          ...data,
          pixCopyPaste: qr.pixCopyPaste,
          pixQrCodeImage: qr.pixQrCodeImage,
          pixPending: false,
        };
      } else if (!data.pixCopyPaste && !data.pixQrCodeImage) {
        setError("Não foi possível gerar o Pix. Tente novamente.");
        return;
      }

      setCheckout(checkoutData);
      startPolling();
    } catch (e) {
      const err = e as Error & { status?: number; code?: string };
      let msg = formatBillingCheckoutError(
        err.message || "Erro ao gerar Pix",
        err.code,
        err.status,
      );
      if (err.status === 409) {
        msg =
          "Há um Pix anterior em processamento. Aguarde 1 minuto e tente de novo.";
      }
      if (err.status === 504) {
        msg =
          "O servidor demorou demais. Aguarde 5 segundos e toque em Gerar Pix novamente.";
      }
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingPhase("create");
    }
  }

  async function copyPix() {
    if (!checkout?.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(checkout.pixCopyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o código abaixo.");
    }
  }

  if (checkout?.paymentMethod === "PIX") {
    const qrSrc = pixQrSrc(checkout.pixQrCodeImage);
    return (
      <div className="space-y-4">
        {qrSrc && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-4">
            <p className="text-sm font-medium w-full text-left">QR Code Pix</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR Code Pix"
              className="w-56 h-56 max-w-full object-contain rounded-lg bg-white p-2"
            />
          </div>
        )}
        {checkout.pixCopyPaste && (
          <div className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
            <p className="text-sm font-medium">Pix copia e cola</p>
            <p className="text-xs text-muted-foreground break-all font-mono max-h-28 overflow-y-auto">
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
        {polling && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Aguardando confirmação do Pix…
          </div>
        )}
        {pollHint && (
          <p className="text-xs text-center text-amber-500/90">{pollHint}</p>
        )}
        <VerifyPaymentButton
          refreshing={refreshing}
          onClick={() => void verifyPayment()}
        />
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={() => {
            setCheckout(null);
            stopPolling();
          }}
        >
          Gerar outro Pix
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PixCheckoutFields
        form={form}
        onChange={(next) => {
          formDirty.current = true;
          setForm(next);
        }}
        disabled={loading}
      />

      {!subscriptionActive && (
        <>
          <Button
            size="lg"
            className="w-full"
            disabled={loading || checkoutBlocked}
            onClick={() => void generatePix()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {loadingPhase === "qr"
                  ? "Preparando QR Code Pix…"
                  : "Criando cobrança Pix…"}
              </>
            ) : (
              "Gerar Pix"
            )}
          </Button>
          {!formReady && !loading && (
            <p className="text-xs text-center text-amber-500/90">
              {pixValidationHint(form)}
            </p>
          )}
        </>
      )}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
