"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import type {
  SubscribeResponse,
  SubscriptionPaymentMethod,
  SubscriptionStatus,
  UserProfile,
} from "@motoboy/types";
import {
  canChooseSubscriptionPaymentMethod,
  normalizeSubscriptionPaymentMethod,
  type SubscriptionBillingStatus,
} from "@/lib/profile-options";
import { useSession } from "next-auth/react";
import { formatBillingCheckoutError } from "@/lib/billing-checkout-errors";
import {
  SubscriptionCheckoutFields,
  buildDefaultCardForm,
  buildDefaultPixForm,
  cardFormToPayload,
  isCardFormValid,
  isPixFormValid,
  pixFormToPayload,
  type CardCheckoutForm,
  type PixCheckoutForm,
} from "@/components/subscription-checkout-fields";

const PAYMENT_POLL_MS = 5000;
const PAYMENT_POLL_MAX_MS = 20 * 60 * 1000;

type Props = {
  initialMethod: SubscriptionPaymentMethod;
  asaasConfigured: boolean;
  /** Gateway não verificado (health/subscription inconclusivos) — não bloqueia campos */
  asaasStatusUnknown?: boolean;
  onActivated?: () => void;
  subscriptionActive?: boolean;
  subscriptionStatus?: SubscriptionBillingStatus | string | null;
  activePaymentMethod?: SubscriptionPaymentMethod | null;
  subscribedAt?: string | null;
};

function pixQrSrc(encodedImage: string | null | undefined): string | null {
  if (!encodedImage?.trim()) return null;
  const raw = encodedImage.trim();
  if (raw.startsWith("data:")) return raw;
  return `data:image/png;base64,${raw}`;
}

export function AsaasTransparentCheckout({
  initialMethod,
  asaasConfigured,
  asaasStatusUnknown = false,
  onActivated,
  subscriptionActive = false,
  subscriptionStatus = "TRIAL",
  activePaymentMethod,
  subscribedAt,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const canChoose = canChooseSubscriptionPaymentMethod(subscriptionStatus);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>(
    () => normalizeSubscriptionPaymentMethod(initialMethod),
  );
  const [pixForm, setPixForm] = useState<PixCheckoutForm>({ cpfCnpj: "" });
  const [cardForm, setCardForm] = useState<CardCheckoutForm>(
    buildDefaultCardForm(null),
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [pollHint, setPollHint] = useState("");
  const [checkout, setCheckout] = useState<SubscribeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollStartedAt = useRef<number | null>(null);
  const pollTick = useRef(0);

  useEffect(() => {
    setPaymentMethod(normalizeSubscriptionPaymentMethod(initialMethod));
  }, [initialMethod]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    void api<UserProfile>("/me/profile")
      .then((p) => {
        setProfile(p);
        setPixForm(buildDefaultPixForm(p));
        setCardForm(buildDefaultCardForm(p));
      })
      .catch(() => {
        void api<{ profile: UserProfile }>("/me").then((me) => {
          setProfile(me.profile);
          setPixForm(buildDefaultPixForm(me.profile));
          setCardForm(buildDefaultCardForm(me.profile));
        });
      })
      .catch(() => {
        /* formulário vazio até o perfil carregar */
      });
  }, [api, sessionStatus]);

  const checkoutBlocked = !asaasConfigured && !asaasStatusUnknown;

  const checkActivation = useCallback(
    async (forceSync = false) => {
      try {
        if (forceSync) {
          await api<{ status: string; activated: boolean }>(
            "/me/subscription/refresh",
            { method: "POST" },
            { skipSync: true },
          );
        }
        const sub = await api<SubscriptionStatus>("/me/subscription", {}, {
          skipSync: true,
        });
        if (sub.status === "ACTIVE") {
          setPolling(false);
          setPollHint("");
          onActivated?.();
          return true;
        }
      } catch {
        /* ignora */
      }
      return false;
    },
    [api, onActivated],
  );

  useEffect(() => {
    if (!checkout || !polling) return;
    pollStartedAt.current ??= Date.now();
    const id = window.setInterval(() => {
      pollTick.current += 1;
      const elapsed = Date.now() - (pollStartedAt.current ?? Date.now());
      if (elapsed > PAYMENT_POLL_MAX_MS) {
        setPolling(false);
        setPollHint(
          "Se já pagou, toque em Verificar pagamento para atualizar o status.",
        );
        return;
      }
      void checkActivation(pollTick.current % 3 === 0);
    }, PAYMENT_POLL_MS);
    return () => window.clearInterval(id);
  }, [checkout, polling, checkActivation]);

  async function persistPaymentPreference(method: SubscriptionPaymentMethod) {
    try {
      await api("/me/profile", {
        method: "PUT",
        body: JSON.stringify({ subscriptionPaymentMethod: method }),
      });
    } catch {
      /* ok */
    }
  }

  function handleSelectMethod(method: SubscriptionPaymentMethod) {
    setPaymentMethod(method);
    setError("");
    void persistPaymentPreference(method);
  }

  async function handleVerifyPayment() {
    setRefreshing(true);
    setError("");
    try {
      const ok = await checkActivation(true);
      if (!ok) {
        setPollHint("Pagamento ainda não confirmado. Tente novamente em instantes.");
        if (!polling) setPolling(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao verificar");
    } finally {
      setRefreshing(false);
    }
  }

  const isPix = paymentMethod === "PIX";
  const formReady = isPix ? isPixFormValid(pixForm) : isCardFormValid(cardForm);

  function validationHint(): string | null {
    if (formReady) return null;
    if (isPix) {
      const d = pixForm.cpfCnpj.replace(/\D/g, "");
      if (d.length < 11) return "Informe o CPF completo (11 dígitos) para gerar o Pix.";
      return "CPF inválido. Confira os números.";
    }
    return "Preencha todos os dados do titular e do cartão.";
  }

  async function startCheckout() {
    if (subscriptionActive) {
      setError("Você já tem assinatura ativa.");
      return;
    }
    if (sessionStatus !== "authenticated") {
      setError("Aguarde o login ou entre de novo.");
      return;
    }
    if (!formReady) {
      setError(validationHint() ?? "Preencha os campos antes de continuar.");
      return;
    }

    setLoading(true);
    setError("");
    setPollHint("");
    setCheckout(null);
    setPolling(false);
    pollStartedAt.current = null;
    pollTick.current = 0;

    const isPix = paymentMethod === "PIX";
    const payload = isPix
      ? { paymentMethod, ...pixFormToPayload(pixForm) }
      : { paymentMethod, ...cardFormToPayload(cardForm) };

    try {
      if (isPix) {
        await api("/me/profile", {
          method: "PUT",
          body: JSON.stringify({ cpfCnpj: pixFormToPayload(pixForm).cpfCnpj }),
        });
      } else {
        const card = cardFormToPayload(cardForm);
        await api("/me/profile", {
          method: "PUT",
          body: JSON.stringify({
            cpfCnpj: card.cpfCnpj,
            name: card.creditCardHolderInfo.name,
            email: card.creditCardHolderInfo.email,
          }),
        });
      }

      const data = await api<SubscribeResponse>("/me/subscribe", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.activated) {
        onActivated?.();
        return;
      }

      if (paymentMethod === "CREDIT_CARD" && data.cardAuthorized) {
        setCheckout(data);
        setPolling(true);
        pollStartedAt.current = Date.now();
        void checkActivation(true);
        return;
      }

      if (
        paymentMethod === "PIX" &&
        !data.pixCopyPaste &&
        !data.pixQrCodeImage
      ) {
        setError("Não foi possível gerar o Pix. Tente novamente.");
        return;
      }

      setCheckout(data);
      setPolling(true);
      pollStartedAt.current = Date.now();
      void checkActivation(true);
    } catch (e) {
      const err = e as Error & { status?: number; code?: string };
      let msg = formatBillingCheckoutError(
        err.message || "Erro ao gerar pagamento",
        err.code,
        err.status,
      );
      if (err.status === 409) {
        msg =
          "Há uma assinatura antiga em processamento. Aguarde 1 minuto e tente de novo.";
      }
      setError(msg);
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
      setError("Não foi possível copiar. Selecione o código abaixo.");
    }
  }

  const verifyButton = (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={refreshing}
      onClick={() => void handleVerifyPayment()}
    >
      {refreshing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Verificando…
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar pagamento
        </>
      )}
    </Button>
  );

  if (checkout?.cardAuthorized) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Cartão validado no Asaas.{" "}
          {polling
            ? "Aguardando confirmação da primeira cobrança…"
            : "Use o botão abaixo se o acesso não liberar sozinho."}
        </div>
        {polling && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Confirmando pagamento…
          </div>
        )}
        {pollHint && (
          <p className="text-xs text-center text-amber-500/90">{pollHint}</p>
        )}
        {verifyButton}
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={() => {
            setCheckout(null);
            setPolling(false);
            setPollHint("");
          }}
        >
          Voltar
        </Button>
      </div>
    );
  }

  if (checkout && paymentMethod === "PIX") {
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
            Aguardando confirmação…
          </div>
        )}
        {pollHint && (
          <p className="text-xs text-center text-amber-500/90">{pollHint}</p>
        )}
        {verifyButton}
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
      {subscriptionStatus === "PAUSED" && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          Pagamento em atraso. Escolha Pix ou cartão e conclua abaixo.
        </div>
      )}

      <SubscriptionCheckoutFields
        paymentMethod={paymentMethod}
        onPaymentMethodChange={canChoose ? handleSelectMethod : undefined}
        subscriptionStatus={subscriptionStatus}
        subscriptionActive={subscriptionActive}
        activePaymentMethod={activePaymentMethod}
        subscribedAt={subscribedAt}
        readOnly={!canChoose}
        disabled={checkoutBlocked || loading}
        profile={profile}
        pixForm={pixForm}
        onPixFormChange={setPixForm}
        cardForm={cardForm}
        onCardFormChange={setCardForm}
      />

      {!subscriptionActive && (
        <>
          <Button
            size="lg"
            className="w-full"
            disabled={loading || checkoutBlocked}
            onClick={startCheckout}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {paymentMethod === "CREDIT_CARD"
                  ? "Processando cartão…"
                  : "Gerando Pix…"}
              </>
            ) : paymentMethod === "CREDIT_CARD" ? (
              "Assinar com cartão"
            ) : (
              "Gerar Pix"
            )}
          </Button>
          {!formReady && !loading && (
            <p className="text-xs text-center text-amber-500/90">
              {validationHint()}
            </p>
          )}
        </>
      )}

      {subscriptionStatus === "CANCELED" && !subscriptionActive && (
        <p className="text-xs text-center text-muted-foreground">
          Conta cancelada anteriormente — você pode assinar de novo com Pix ou cartão.
        </p>
      )}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {canChoose && (
        <p className="text-xs text-center text-muted-foreground">
          Prefere alterar depois?{" "}
          <Link href="/config?tab=pagamento" className="text-primary underline">
            Configurações → Pagamento
          </Link>
        </p>
      )}
    </div>
  );
}
