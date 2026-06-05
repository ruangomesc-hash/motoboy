"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2 } from "lucide-react";
import type { SubscribeResponse } from "@motoboy/types";
import { formatBillingCheckoutError } from "@/lib/billing-checkout-errors";
import {
  clearPixCheckoutSession,
  readPixCheckoutSession,
  writePixCheckoutSession,
} from "@/lib/pix-checkout-session";
import {
  fetchPixQrWithServerWait,
  pixQrSrc,
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

function checkoutFromPending(pending: PendingPixResponse): SubscribeResponse {
  return {
    amount: pending.amount ?? 0,
    chargeId: pending.chargeId!,
    paymentMethod: "PIX",
    pixCopyPaste: pending.pixCopyPaste ?? null,
    pixQrCodeImage: pending.pixQrCodeImage ?? null,
    pixPending: pending.pixPending ?? !hasPixQr(pending),
  };
}

function checkoutFromSession(): SubscribeResponse | null {
  const saved = readPixCheckoutSession();
  if (!saved?.chargeId) return null;
  return checkoutFromPending({
    pending: true,
    chargeId: saved.chargeId,
    amount: saved.amount,
    pixCopyPaste: saved.pixCopyPaste,
    pixQrCodeImage: saved.pixQrCodeImage,
    pixPending: !hasPixQr(saved),
  });
}

function persistCheckoutState(data: SubscribeResponse): void {
  if (!data.chargeId) return;
  writePixCheckoutSession({
    chargeId: data.chargeId,
    amount: data.amount,
    pixCopyPaste: data.pixCopyPaste,
    pixQrCodeImage: data.pixQrCodeImage,
    updatedAt: Date.now(),
  });
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
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(() =>
    checkoutFromSession(),
  );
  const [copied, setCopied] = useState(false);
  const formHydrated = useRef(false);
  const formDirty = useRef(false);
  const autoResumeDone = useRef(false);
  const qrLoadInFlight = useRef(false);

  const commitCheckout = useCallback((next: SubscribeResponse | null) => {
    setCheckout(next);
    if (next?.chargeId && next.paymentMethod === "PIX") {
      persistCheckoutState(next);
    }
  }, []);

  const {
    polling,
    pollHint,
    refreshing,
    startPolling,
    stopPolling,
    verifyPayment,
  } = usePaymentActivationPoll(checkout, () => {
    clearPixCheckoutSession();
    onActivated?.();
  });

  const clearPixCheckout = useCallback(() => {
    setCheckout(null);
    clearPixCheckoutSession();
    stopPolling();
  }, [stopPolling]);

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

  const fetchPendingFast = useCallback(
    async (apiClient: ReturnType<typeof useApi>): Promise<PendingPixResponse | null> => {
      try {
        const pending = await apiClient<PendingPixResponse>(
          "/me/subscribe/pix/pending",
          {},
          { skipSync: true },
        );
        if (pending.pending && pending.chargeId) return pending;
      } catch {
        /* fallback session */
      }

      const saved = readPixCheckoutSession();
      if (!saved?.chargeId) return null;
      return {
        pending: true,
        chargeId: saved.chargeId,
        amount: saved.amount,
        pixCopyPaste: saved.pixCopyPaste,
        pixQrCodeImage: saved.pixQrCodeImage,
        pixPending: !hasPixQr(saved),
      };
    },
    [],
  );

  const fetchQrForCharge = useCallback(
    async (
      apiClient: ReturnType<typeof useApi>,
      chargeId: string,
      base: SubscribeResponse,
    ): Promise<SubscribeResponse | null> => {
      const qr = await fetchPixQrWithServerWait(apiClient, chargeId);
      if (!qr) return null;
      return {
        ...base,
        chargeId,
        paymentMethod: "PIX",
        pixCopyPaste: qr.pixCopyPaste,
        pixQrCodeImage: qr.pixQrCodeImage,
        pixPending: false,
      };
    },
    [],
  );

  const loadQrForCheckout = useCallback(
    async (chargeId: string, base: SubscribeResponse): Promise<boolean> => {
      if (qrLoadInFlight.current) return Boolean(hasPixQr(base));
      qrLoadInFlight.current = true;
      setQrFetching(true);
      setError("");
      try {
        const withQr = await fetchQrForCharge(api, chargeId, base);
        if (!withQr) {
          commitCheckout({ ...base, chargeId, pixPending: true });
          return false;
        }
        commitCheckout(withQr);
        startPolling();
        return true;
      } finally {
        setQrFetching(false);
        qrLoadInFlight.current = false;
      }
    },
    [api, commitCheckout, fetchQrForCharge, startPolling],
  );

  const openPendingPixCheckout = useCallback(
    async (pending: PendingPixResponse): Promise<boolean> => {
      if (!pending.chargeId) return false;
      setLoadingPhase("qr");
      const base = checkoutFromPending(pending);
      if (hasPixQr(pending)) {
        commitCheckout({ ...base, pixPending: false });
        startPolling();
        return true;
      }
      commitCheckout(base);
      return loadQrForCheckout(pending.chargeId, base);
    },
    [commitCheckout, loadQrForCheckout, startPolling],
  );

  const resumePixCheckout = useCallback(async () => {
    const pending = await fetchPendingFast(api);
    if (!pending?.chargeId) return false;
    await openPendingPixCheckout(pending);
    return true;
  }, [api, fetchPendingFast, openPendingPixCheckout]);

  useEffect(() => {
    if (
      autoResumeDone.current ||
      subscriptionActive ||
      sessionStatus !== "authenticated"
    ) {
      return;
    }
    autoResumeDone.current = true;

    if (!checkout?.chargeId) {
      const fromSession = checkoutFromSession();
      if (fromSession) commitCheckout(fromSession);
    }

    void resumePixCheckout();
  }, [
    checkout?.chargeId,
    commitCheckout,
    resumePixCheckout,
    sessionStatus,
    subscriptionActive,
  ]);

  const activeCheckout =
    checkout ??
    (readPixCheckoutSession()?.chargeId ? checkoutFromSession() : null);

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
      setLoadingPhase("create");

      const data = await requestSubscribeWithRetry(api, {
        paymentMethod: "PIX",
        ...pixFormToPayload(form),
      });

      if (data.activated) {
        clearPixCheckoutSession();
        onActivated?.();
        return;
      }

      if (data.paymentMethod !== "PIX") {
        setError("Resposta inválida do servidor. Tente gerar o Pix novamente.");
        return;
      }

      if (hasPixQr(data)) {
        commitCheckout({ ...data, pixPending: false });
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

      const resumed = await resumePixCheckout();
      if (resumed) return;

      if (checkout?.chargeId || readPixCheckoutSession()?.chargeId) {
        const saved = checkout ?? checkoutFromSession();
        if (saved?.chargeId) {
          commitCheckout(saved);
          void loadQrForCheckout(saved.chargeId, saved);
          return;
        }
      }

      setError(msg);
    } finally {
      setLoading(false);
      if (!readPixCheckoutSession()?.chargeId) {
        setLoadingPhase("create");
      }
    }
  }

  async function copyPix() {
    const code = activeCheckout?.pixCopyPaste;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o código abaixo.");
    }
  }

  if (activeCheckout?.paymentMethod === "PIX" && activeCheckout.chargeId) {
    const qrSrc = pixQrSrc(activeCheckout.pixQrCodeImage);
    const missingQr = !activeCheckout.pixCopyPaste && !qrSrc;

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
        {activeCheckout.pixCopyPaste && (
          <div className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
            <p className="text-sm font-medium">Pix copia e cola</p>
            <p className="text-xs text-muted-foreground break-all font-mono max-h-28 overflow-y-auto">
              {activeCheckout.pixCopyPaste}
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
          onClick={() => clearPixCheckout()}
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
