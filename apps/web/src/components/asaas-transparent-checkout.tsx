"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, CreditCard, ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
import { PaymentMethodCards } from "@/components/payment-method-cards";
import { useSession } from "next-auth/react";
import { cpfDigits, maskCpfInput } from "@/lib/cpf-mask";
import { isAsaasHostedInvoiceUrl, isValidCpfDigits } from "@/lib/asaas-checkout";

const PAYMENT_POLL_MS = 5000;
const PAYMENT_POLL_MAX_MS = 20 * 60 * 1000;

type Props = {
  initialMethod: SubscriptionPaymentMethod;
  asaasConfigured: boolean;
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

function cpfFromProfile(profile: UserProfile | null): string {
  if (!profile?.cpfCnpj) return "";
  return maskCpfInput(profile.cpfCnpj);
}

export function AsaasTransparentCheckout({
  initialMethod,
  asaasConfigured,
  onActivated,
  subscriptionActive = false,
  subscriptionStatus = "TRIAL",
  activePaymentMethod,
  subscribedAt,
}: Props) {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const canChoose = canChooseSubscriptionPaymentMethod(subscriptionStatus);
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>(
    () => normalizeSubscriptionPaymentMethod(initialMethod),
  );
  const [cpf, setCpf] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
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
      .then((p) => setCpf(cpfFromProfile(p)))
      .catch(() => {
        void api<{ profile: UserProfile }>("/me").then((me) =>
          setCpf(cpfFromProfile(me.profile)),
        );
      })
      .finally(() => setProfileLoaded(true));
  }, [api, sessionStatus]);

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
        /* ignora falha pontual */
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
          "Ainda não recebemos a confirmação. Se já pagou, toque em “Verificar pagamento”.",
        );
        return;
      }
      const forceSync = pollTick.current % 3 === 0;
      void checkActivation(forceSync);
    }, PAYMENT_POLL_MS);

    return () => window.clearInterval(id);
  }, [checkout, polling, checkActivation]);

  async function handleVerifyPayment() {
    setRefreshing(true);
    setError("");
    try {
      const activated = await checkActivation(true);
      if (!activated) {
        setPollHint(
          "Pagamento ainda não confirmado. Aguarde alguns segundos e tente de novo.",
        );
        if (!polling) setPolling(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao verificar pagamento");
    } finally {
      setRefreshing(false);
    }
  }

  async function persistPaymentPreference(method: SubscriptionPaymentMethod) {
    try {
      await api("/me/profile", {
        method: "PUT",
        body: JSON.stringify({ subscriptionPaymentMethod: method }),
      });
    } catch {
      /* preferência local ainda vale no checkout */
    }
  }

  function handleSelectMethod(method: SubscriptionPaymentMethod) {
    setPaymentMethod(method);
    setError("");
    void persistPaymentPreference(method);
  }

  function resolveCpfDigits(): string | null {
    const digits = cpfDigits(cpf);
    if (digits.length !== 11) return null;
    if (!isValidCpfDigits(digits)) return null;
    return digits;
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

    const cpfValidated = resolveCpfDigits();
    if (!cpfValidated) {
      const digits = cpfDigits(cpf);
      setError(
        digits.length !== 11
          ? "Informe seu CPF completo (11 dígitos)."
          : "CPF inválido. Confira os números.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setPollHint("");
    setCheckout(null);
    setPolling(false);
    pollStartedAt.current = null;
    pollTick.current = 0;

    try {
      await api("/me/profile", {
        method: "PUT",
        body: JSON.stringify({ cpfCnpj: cpfValidated }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar CPF");
      setLoading(false);
      return;
    }

    try {
      const data = await api<SubscribeResponse>("/me/subscribe", {
        method: "POST",
        body: JSON.stringify({ paymentMethod, cpfCnpj: cpfValidated }),
      });

      const isCard = paymentMethod === "CREDIT_CARD";
      if (isCard && !isAsaasHostedInvoiceUrl(data.invoiceUrl)) {
        setError(
          "Não foi possível abrir o pagamento com cartão. Tente de novo em alguns segundos.",
        );
        return;
      }

      if (
        !isCard &&
        !data.pixCopyPaste &&
        !data.pixQrCodeImage
      ) {
        setError(
          "Não foi possível gerar o Pix. Confira o CPF e tente novamente.",
        );
        return;
      }

      setCheckout(data);
      setPolling(true);
      pollStartedAt.current = Date.now();
      void checkActivation(true);
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

  const isCardCheckout = paymentMethod === "CREDIT_CARD";
  const cardInvoiceReady =
    checkout && isAsaasHostedInvoiceUrl(checkout.invoiceUrl);

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

  if (checkout) {
    const qrSrc = pixQrSrc(checkout.pixQrCodeImage);

    if (isCardCheckout) {
      if (cardInvoiceReady) {
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Pagamento com cartão
              </p>
              <p className="text-xs text-muted-foreground">
                Abra o checkout seguro do Asaas, informe o cartão e conclua. Depois
                volte aqui — confirmamos automaticamente em alguns segundos.
              </p>
              <Button size="lg" className="w-full" asChild>
                <a
                  href={checkout.invoiceUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir pagamento com cartão
                </a>
              </Button>
            </div>
            {polling ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Aguardando confirmação do pagamento…
              </div>
            ) : null}
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
                pollStartedAt.current = null;
              }}
            >
              Voltar
            </Button>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <p className="text-sm text-destructive text-center">
            {error ||
              "Não foi possível abrir o checkout do cartão. Volte e tente novamente."}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              setCheckout(null);
              setPolling(false);
              setError("");
              setPollHint("");
            }}
          >
            Voltar
          </Button>
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
              alt="QR Code Pix para pagamento"
              className="w-56 h-56 max-w-full object-contain rounded-lg bg-white p-2"
            />
            <p className="text-xs text-muted-foreground text-center">
              Escaneie no app do seu banco
            </p>
          </div>
        )}

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

        {!checkout.pixCopyPaste && !qrSrc && (
          <p className="text-sm text-destructive text-center">
            Não foi possível gerar o Pix. Volte e confira o CPF.
          </p>
        )}

        {(checkout.pixCopyPaste || qrSrc) && polling ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Aguardando confirmação do pagamento…
          </div>
        ) : null}

        {pollHint && (
          <p className="text-xs text-center text-amber-500/90">{pollHint}</p>
        )}

        {(checkout.pixCopyPaste || qrSrc) && verifyButton}

        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={() => {
            setCheckout(null);
            setPolling(false);
            setPollHint("");
            pollStartedAt.current = null;
          }}
        >
          Voltar
        </Button>
      </div>
    );
  }

  const cpfOk = cpfDigits(cpf).length === 11 && isValidCpfDigits(cpfDigits(cpf));

  return (
    <div className="space-y-4">
      {subscriptionStatus === "PAUSED" && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          Pagamento em atraso. Escolha Pix ou cartão para regularizar e liberar o
          acesso.
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Forma de pagamento</p>
        <PaymentMethodCards
          selected={paymentMethod}
          onSelect={canChoose ? handleSelectMethod : undefined}
          activeMethod={activePaymentMethod}
          subscriptionActive={subscriptionActive}
          subscriptionStatus={subscriptionStatus}
          subscribedAt={subscribedAt}
          readOnly={!canChoose}
          disabled={!asaasConfigured}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="checkout-cpf">
          CPF do titular
        </label>
        <Input
          id="checkout-cpf"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => {
            setCpf(maskCpfInput(e.target.value));
            setError("");
          }}
          disabled={!profileLoaded || loading}
        />
        <p className="text-xs text-muted-foreground">
          Obrigatório para Pix e cartão (cobrança Asaas no seu nome).
        </p>
      </div>

      {!subscriptionActive && (
        <Button
          size="lg"
          className="w-full"
          disabled={loading || !asaasConfigured || !cpfOk}
          onClick={startCheckout}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando cobrança…
            </>
          ) : isCardCheckout ? (
            "Continuar com cartão"
          ) : (
            "Continuar com Pix"
          )}
        </Button>
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
