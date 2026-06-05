"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import type { SubscribeResponse, UserProfile } from "@motoboy/types";
import { formatBillingCheckoutError } from "@/lib/billing-checkout-errors";
import {
  clearPixCheckoutSession,
  readPixCheckoutSession,
  writePixCheckoutSession,
} from "@/lib/pix-checkout-session";
import { pixQrSrc, requestSubscribeWithRetry } from "./shared";
import {
  PixCheckoutFields,
  buildDefaultPixForm,
  isPixFormValid,
  pixFormToPayload,
  pixValidationHint,
  type PixCheckoutForm,
} from "./pix-checkout-fields";
import { useCheckoutProfile } from "./use-checkout-profile";
import {
  usePaymentActivationPoll,
  type PaymentActivatedHandler,
} from "./use-payment-activation-poll";
import { useRealtimePixQr } from "./use-realtime-pix-qr";
import { VerifyPaymentButton } from "./verify-payment-button";

type Props = {
  asaasConfigured: boolean;
  asaasStatusUnknown?: boolean;
  subscriptionActive?: boolean;
  subscriptionRefreshing?: boolean;
  /** Oculta banner “ativa” quando o pai já exibe (ex.: gerenciar assinatura). */
  hideActiveBanner?: boolean;
  onActivated?: PaymentActivatedHandler;
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
  subscriptionRefreshing = false,
  hideActiveBanner = false,
  onActivated,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const profile = useCheckoutProfile();
  const [form, setForm] = useState<PixCheckoutForm>({ cpfCnpj: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(() =>
    subscriptionActive ? null : checkoutFromSession(),
  );
  const [copied, setCopied] = useState(false);
  const [cpfPersisted, setCpfPersisted] = useState(false);
  const formHydrated = useRef(false);
  const formDirty = useRef(false);
  const autoResumeDone = useRef(false);
  const prepareSent = useRef<string | null>(null);

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
    checkInFlight,
    startPolling,
    stopPolling,
    verifyPayment,
  } = usePaymentActivationPoll(checkout, (subscribedAt) => {
    clearPixCheckoutSession();
    onActivated?.(subscribedAt);
  });

  const clearPixCheckout = useCallback(() => {
    setCheckout(null);
    clearPixCheckoutSession();
    stopPolling();
  }, [stopPolling]);

  const showPixCheckout = useCallback(
    (base: SubscribeResponse) => {
      commitCheckout(base);
      if (base.chargeId) {
        startPolling();
      }
    },
    [commitCheckout, startPolling],
  );

  const handleQrReady = useCallback(
    (qr: { pixCopyPaste: string | null; pixQrCodeImage: string | null }) => {
      setCheckout((prev) => {
        if (!prev?.chargeId) return prev;
        const next: SubscribeResponse = {
          ...prev,
          pixCopyPaste: qr.pixCopyPaste,
          pixQrCodeImage: qr.pixQrCodeImage,
          pixPending: false,
        };
        persistCheckoutState(next);
        return next;
      });
      startPolling();
    },
    [startPolling],
  );

  const activeCheckout = subscriptionActive
    ? null
    : checkout ??
      (readPixCheckoutSession()?.chargeId ? checkoutFromSession() : null);

  const needsRealtimeQr =
    !subscriptionActive &&
    Boolean(activeCheckout?.chargeId) &&
    !hasPixQr(activeCheckout ?? {});

  useRealtimePixQr(
    activeCheckout?.chargeId,
    api,
    handleQrReady,
    needsRealtimeQr && sessionStatus === "authenticated",
  );

  useEffect(() => {
    if (profile?.cpfCnpj?.replace(/\D/g, "").length === 11) {
      setCpfPersisted(true);
    }
  }, [profile?.cpfCnpj]);

  useEffect(() => {
    if (!profile?.cpfCnpj) return;
    const savedCpf = buildDefaultPixForm(profile).cpfCnpj;
    setForm((prev) => {
      const prevDigits = prev.cpfCnpj.replace(/\D/g, "");
      const savedDigits = savedCpf.replace(/\D/g, "");
      if (
        formDirty.current &&
        prevDigits.length >= 11 &&
        prevDigits !== savedDigits
      ) {
        return prev;
      }
      if (prevDigits === savedDigits) return prev;
      return { cpfCnpj: savedCpf };
    });
    if (!formHydrated.current) formHydrated.current = true;
  }, [profile?.cpfCnpj]);

  useEffect(() => {
    if (!profile || formHydrated.current) return;
    setForm((prev) =>
      formDirty.current || prev.cpfCnpj.replace(/\D/g, "").length > 0
        ? prev
        : buildDefaultPixForm(profile),
    );
    formHydrated.current = true;
  }, [profile]);

  useEffect(() => {
    if (!subscriptionActive) return;
    setCheckout(null);
    clearPixCheckoutSession();
    stopPolling();
  }, [subscriptionActive, stopPolling]);

  useEffect(() => {
    if (!subscriptionActive || sessionStatus !== "authenticated") return;
    void api<UserProfile>("/me/profile", {}, { skipSync: true })
      .then((p) => {
        if (!p.cpfCnpj) return;
        setForm(buildDefaultPixForm(p));
        setCpfPersisted(true);
      })
      .catch(() => {
        /* perfil indisponível */
      });
  }, [api, sessionStatus, subscriptionActive]);

  const checkoutBlocked = !asaasConfigured && !asaasStatusUnknown;
  const formReady = isPixFormValid(form);

  useEffect(() => {
    if (!formReady || sessionStatus !== "authenticated") return;
    const cpf = form.cpfCnpj.replace(/\D/g, "");
    if (prepareSent.current === cpf) return;

    const timer = window.setTimeout(() => {
      prepareSent.current = cpf;
      void api(
        "/me/subscribe/pix/prepare",
        {
          method: "POST",
          body: JSON.stringify({ cpfCnpj: cpf }),
        },
        { skipSync: true },
      )
        .then(() => {
          setCpfPersisted(true);
        })
        .catch(() => {
          prepareSent.current = null;
        });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [api, form.cpfCnpj, formReady, sessionStatus]);

  const fetchPendingFast = useCallback(async (): Promise<PendingPixResponse | null> => {
    try {
      const pending = await api<PendingPixResponse>(
        "/me/subscribe/pix/pending",
        {},
        { skipSync: true },
      );
      if (pending.pending && pending.chargeId) return pending;
    } catch {
      /* session */
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
  }, [api]);

  useEffect(() => {
    if (
      autoResumeDone.current ||
      subscriptionActive ||
      sessionStatus !== "authenticated"
    ) {
      return;
    }
    autoResumeDone.current = true;

    void (async () => {
      if (!checkout?.chargeId) {
        const fromSession = checkoutFromSession();
        if (fromSession) showPixCheckout(fromSession);
      }
      const pending = await fetchPendingFast();
      if (pending?.chargeId) {
        showPixCheckout(checkoutFromPending(pending));
      }
    })();
  }, [
    checkout?.chargeId,
    fetchPendingFast,
    sessionStatus,
    showPixCheckout,
    subscriptionActive,
  ]);

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
      const data = await requestSubscribeWithRetry(api, {
        paymentMethod: "PIX",
        ...pixFormToPayload(form),
      });

      if (data.activated) {
        clearPixCheckoutSession();
        onActivated?.(new Date().toISOString());
        return;
      }

      if (data.paymentMethod !== "PIX") {
        setError("Resposta inválida do servidor. Tente gerar o Pix novamente.");
        return;
      }

      if (!data.chargeId) {
        setError("Não foi possível gerar o Pix. Tente novamente.");
        return;
      }

      showPixCheckout({
        amount: data.amount,
        chargeId: data.chargeId,
        paymentMethod: "PIX",
        pixCopyPaste: data.pixCopyPaste ?? null,
        pixQrCodeImage: data.pixQrCodeImage ?? null,
        pixPending: !hasPixQr(data),
      });
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

      const pending = await fetchPendingFast();
      if (pending?.chargeId) {
        showPixCheckout(checkoutFromPending(pending));
        return;
      }

      const saved = checkout ?? checkoutFromSession();
      if (saved?.chargeId) {
        showPixCheckout(saved);
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
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

  const cpfSaved = subscriptionActive || cpfPersisted;

  if (
    !subscriptionActive &&
    activeCheckout?.paymentMethod === "PIX" &&
    activeCheckout.chargeId
  ) {
    const qrSrc = pixQrSrc(activeCheckout.pixQrCodeImage);
    const missingQr = !activeCheckout.pixCopyPaste && !qrSrc;

    if (missingQr) {
      return (
        <div className="space-y-4 text-center py-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-medium">Pix gerado</p>
          <p className="text-xs text-muted-foreground">
            O QR Code aparece aqui em instantes…
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
        {(polling || checkInFlight) && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
            <p className="text-sm font-medium text-emerald-100">
              {checkInFlight
                ? "Confirmando sua assinatura…"
                : "Verificando pagamento em tempo real…"}
            </p>
            <p className="text-xs text-muted-foreground">
              Assim que o Pix for confirmado, seu acesso libera na hora.
            </p>
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
      {subscriptionActive && !hideActiveBanner && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-300 flex items-center gap-2">
            {subscriptionRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Assinatura Pix ativa
          </p>
          <p className="text-xs text-muted-foreground">
            {subscriptionRefreshing
              ? "Sincronizando detalhes da assinatura…"
              : "Suas cobranças mensais são geradas automaticamente. Não é necessário gerar um novo Pix."}
          </p>
        </div>
      )}

      <PixCheckoutFields
        form={form}
        onChange={(next) => {
          formDirty.current = true;
          setForm(next);
        }}
        disabled={loading}
        cpfSaved={cpfSaved}
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
                Criando cobrança Pix…
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
