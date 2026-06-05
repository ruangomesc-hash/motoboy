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

type PendingPixResponse = {
  pending: boolean;
  chargeId?: string;
  amount?: number;
  pixPending?: boolean;
  pixCopyPaste?: string | null;
  pixQrCodeImage?: string | null;
};

function hasPixQr(data: {
  pixCopyPaste?: string | null;
  pixQrCodeImage?: string | null;
}): boolean {
  return Boolean(data.pixCopyPaste?.trim() || data.pixQrCodeImage?.trim());
}

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
  const [qrFetching, setQrFetching] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const formHydrated = useRef(false);
  const formDirty = useRef(false);
  const autoResumeDone = useRef(false);
  const qrLoadInFlight = useRef(false);

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

  async function fetchQrForCharge(
    apiClient: ReturnType<typeof useApi>,
    chargeId: string,
    base: SubscribeResponse,
    opts?: { maxMs?: number },
  ): Promise<SubscribeResponse | null> {
    const qr = await pollPixQrUntilReady(apiClient, chargeId, {
      maxMs: opts?.maxMs ?? 45_000,
    });
    if (!qr) return null;
    return {
      ...base,
      chargeId,
      paymentMethod: "PIX",
      pixCopyPaste: qr.pixCopyPaste,
      pixQrCodeImage: qr.pixQrCodeImage,
      pixPending: false,
    };
  }

  function pendingToCheckout(pending: PendingPixResponse): SubscribeResponse {
    return {
      amount: pending.amount ?? 0,
      chargeId: pending.chargeId!,
      paymentMethod: "PIX",
      pixCopyPaste: pending.pixCopyPaste ?? null,
      pixQrCodeImage: pending.pixQrCodeImage ?? null,
      pixPending: pending.pixPending ?? true,
    };
  }

  async function tryRecoverPendingPix(
    apiClient: ReturnType<typeof useApi>,
    opts?: { maxMs?: number },
  ): Promise<SubscribeResponse | null> {
    try {
      const pending = await apiClient<PendingPixResponse>(
        "/me/subscribe/pix/pending",
        {},
        { skipSync: true },
      );
      if (!pending.pending || !pending.chargeId) return null;
      if (hasPixQr(pending) && !pending.pixPending) {
        return pendingToCheckout({ ...pending, pixPending: false });
      }
      return await fetchQrForCharge(
        apiClient,
        pending.chargeId,
        pendingToCheckout(pending),
        opts,
      );
    } catch {
      return null;
    }
  }

  async function loadQrForCheckout(
    chargeId: string,
    base: SubscribeResponse,
  ): Promise<boolean> {
    if (qrLoadInFlight.current) return false;
    qrLoadInFlight.current = true;
    setQrFetching(true);
    setError("");
    try {
      const withQr = await fetchQrForCharge(api, chargeId, base);
      if (!withQr) {
        setCheckout({ ...base, chargeId, pixPending: true });
        return false;
      }
      setCheckout(withQr);
      startPolling();
      return true;
    } finally {
      setQrFetching(false);
      qrLoadInFlight.current = false;
    }
  }

  async function openPendingPixCheckout(
    pending: PendingPixResponse,
  ): Promise<boolean> {
    if (!pending.chargeId) return false;
    setLoadingPhase("qr");
    const base = pendingToCheckout(pending);
    if (hasPixQr(pending)) {
      setCheckout({ ...base, pixPending: false });
      startPolling();
      return true;
    }
    setCheckout(base);
    return loadQrForCheckout(pending.chargeId, base);
  }

  useEffect(() => {
    if (
      autoResumeDone.current ||
      checkout ||
      loading ||
      subscriptionActive ||
      sessionStatus !== "authenticated"
    ) {
      return;
    }
    autoResumeDone.current = true;
    void (async () => {
      const pending = await api<PendingPixResponse>(
        "/me/subscribe/pix/pending",
        {},
        { skipSync: true },
      ).catch(() => null);
      if (!pending?.pending || !pending.chargeId) return;
      await openPendingPixCheckout(pending);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recuperação única ao montar
  }, [sessionStatus, subscriptionActive]);

  useEffect(() => {
    if (!checkout?.chargeId || hasPixQr(checkout) || qrFetching) return;
    if (loading && loadingPhase === "create") return;

    const timer = window.setTimeout(() => {
      void loadQrForCheckout(checkout.chargeId, checkout);
    }, 3000);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- retenta até o QR aparecer
  }, [checkout, qrFetching, loading, loadingPhase]);

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
    setError("");
    stopPolling();

    try {
      const existing = await api<PendingPixResponse>(
        "/me/subscribe/pix/pending",
        {},
        { skipSync: true },
      ).catch(() => null);

      if (existing?.pending && existing.chargeId) {
        await openPendingPixCheckout(existing);
        return;
      }

      setCheckout(null);
      setLoadingPhase("create");

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

      if (hasPixQr(data)) {
        setCheckout({ ...data, pixPending: false });
        startPolling();
        return;
      }

      if (data.chargeId) {
        await openPendingPixCheckout({
          pending: true,
          chargeId: data.chargeId,
          amount: data.amount,
          pixPending: data.pixPending ?? true,
          pixCopyPaste: data.pixCopyPaste,
          pixQrCodeImage: data.pixQrCodeImage,
        });
        return;
      }

      setError("Não foi possível gerar o Pix. Tente novamente.");
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
      if (err.status === 504 || err.code === "ASAAS_TIMEOUT") {
        const pending = await api<PendingPixResponse>(
          "/me/subscribe/pix/pending",
          {},
          { skipSync: true },
        ).catch(() => null);
        if (pending?.pending && pending.chargeId) {
          await openPendingPixCheckout(pending);
          return;
        }
        const recovered = await tryRecoverPendingPix(api, { maxMs: 45_000 });
        if (recovered) {
          setCheckout(recovered);
          startPolling();
          return;
        }
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
    const missingQr = !checkout.pixCopyPaste && !qrSrc;

    if (missingQr) {
      return (
        <div className="space-y-4 text-center py-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-medium">Carregando código Pix</p>
          <p className="text-xs text-muted-foreground">
            A cobrança já foi gerada. Buscando QR Code e copia e cola no checkout…
          </p>
        </div>
      );
    }

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
