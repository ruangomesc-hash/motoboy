"use client";

import { useEffect, useState } from "react";
import type { SubscriptionPaymentMethod, UserProfile } from "@motoboy/types";
import { PaymentMethodCards } from "@/components/payment-method-cards";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { cpfDigits, maskCpfInput } from "@/lib/cpf-mask";
import { isValidCpfDigits } from "@/lib/asaas-checkout";
import {
  cardNumberDigits,
  cepDigits,
  maskCardExpiryInput,
  maskCardNumberInput,
  maskCepInput,
  maskPhoneBillingInput,
  parseCardExpiry,
  phoneBillingDigits,
} from "@/lib/payment-masks";
import { whatsappStoredToLocalInput } from "@/lib/me-settings";
import type { SubscriptionBillingStatus } from "@/lib/profile-options";

export type PixCheckoutForm = {
  cpfCnpj: string;
};

export type CardCheckoutForm = {
  holderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
    addressComplement: string;
  };
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
};

type Props = {
  paymentMethod: SubscriptionPaymentMethod;
  onPaymentMethodChange?: (method: SubscriptionPaymentMethod) => void;
  subscriptionStatus?: SubscriptionBillingStatus | string | null;
  subscriptionActive?: boolean;
  activePaymentMethod?: SubscriptionPaymentMethod | null;
  subscribedAt?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  profile: UserProfile | null;
  pixForm: PixCheckoutForm;
  onPixFormChange: (next: PixCheckoutForm) => void;
  cardForm: CardCheckoutForm;
  onCardFormChange: (next: CardCheckoutForm) => void;
};

function buildInitialCardForm(profile: UserProfile | null): CardCheckoutForm {
  const phone =
    profile?.whatsappNumber != null
      ? whatsappStoredToLocalInput(profile.whatsappNumber)
      : "";
  return {
    holderInfo: {
      name: profile?.name?.trim() ?? "",
      email: profile?.email?.trim() ?? "",
      cpfCnpj: profile?.cpfCnpj ? maskCpfInput(profile.cpfCnpj) : "",
      postalCode: "",
      addressNumber: "",
      phone: phone ? maskPhoneBillingInput(phone.replace(/\D/g, "").slice(-11)) : "",
      addressComplement: "",
    },
    card: {
      holderName: profile?.name?.trim() ?? "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      ccv: "",
    },
  };
}

export function buildDefaultCardForm(profile: UserProfile | null): CardCheckoutForm {
  return buildInitialCardForm(profile);
}

export function buildDefaultPixForm(profile: UserProfile | null): PixCheckoutForm {
  return {
    cpfCnpj: profile?.cpfCnpj ? maskCpfInput(profile.cpfCnpj) : "",
  };
}

export function isPixFormValid(form: PixCheckoutForm): boolean {
  const digits = cpfDigits(form.cpfCnpj);
  return digits.length === 11 && isValidCpfDigits(digits);
}

export function isCardFormValid(form: CardCheckoutForm): boolean {
  const cpf = cpfDigits(form.holderInfo.cpfCnpj);
  const expiryOk =
    form.card.expiryMonth.length === 2 &&
    form.card.expiryYear.length === 4 &&
    Number(form.card.expiryMonth) >= 1 &&
    Number(form.card.expiryMonth) <= 12 &&
    Number(form.card.expiryYear) >= new Date().getFullYear();

  return (
    cpf.length === 11 &&
    isValidCpfDigits(cpf) &&
    form.holderInfo.name.trim().length >= 3 &&
    form.holderInfo.email.includes("@") &&
    cepDigits(form.holderInfo.postalCode).length === 8 &&
    form.holderInfo.addressNumber.trim().length >= 1 &&
    phoneBillingDigits(form.holderInfo.phone).replace(/\D/g, "").length >= 10 &&
    cardNumberDigits(form.card.number).length >= 13 &&
    form.card.holderName.trim().length >= 3 &&
    form.card.ccv.replace(/\D/g, "").length >= 3 &&
    expiryOk
  );
}

export function pixFormToPayload(form: PixCheckoutForm) {
  return { cpfCnpj: cpfDigits(form.cpfCnpj) };
}

export function cardFormToPayload(form: CardCheckoutForm) {
  return {
    cpfCnpj: cpfDigits(form.holderInfo.cpfCnpj),
    creditCard: {
      holderName: form.card.holderName.trim(),
      number: cardNumberDigits(form.card.number),
      expiryMonth: form.card.expiryMonth,
      expiryYear: form.card.expiryYear,
      ccv: form.card.ccv.replace(/\D/g, ""),
    },
    creditCardHolderInfo: {
      name: form.holderInfo.name.trim(),
      email: form.holderInfo.email.trim().toLowerCase(),
      cpfCnpj: cpfDigits(form.holderInfo.cpfCnpj),
      postalCode: cepDigits(form.holderInfo.postalCode),
      addressNumber: form.holderInfo.addressNumber.trim(),
      phone: phoneBillingDigits(form.holderInfo.phone),
      ...(form.holderInfo.addressComplement.trim()
        ? { addressComplement: form.holderInfo.addressComplement.trim() }
        : {}),
    },
  };
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  disabled,
  className,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1"
        autoComplete="off"
      />
    </div>
  );
}

export function SubscriptionCheckoutFields({
  paymentMethod,
  onPaymentMethodChange,
  subscriptionStatus,
  subscriptionActive = false,
  activePaymentMethod,
  subscribedAt,
  disabled = false,
  readOnly = false,
  profile,
  pixForm,
  onPixFormChange,
  cardForm,
  onCardFormChange,
}: Props) {
  const [expiryDisplay, setExpiryDisplay] = useState("");

  useEffect(() => {
    if (cardForm.card.expiryMonth && cardForm.card.expiryYear) {
      setExpiryDisplay(
        `${cardForm.card.expiryMonth}/${cardForm.card.expiryYear.slice(-2)}`,
      );
    }
  }, [cardForm.card.expiryMonth, cardForm.card.expiryYear]);

  const isPix = paymentMethod === "PIX";

  return (
    <div className="space-y-3">
      <PaymentMethodCards
        selected={paymentMethod}
        onSelect={onPaymentMethodChange}
        activeMethod={activePaymentMethod}
        subscriptionActive={subscriptionActive}
        subscriptionStatus={subscriptionStatus}
        subscribedAt={subscribedAt}
        readOnly={readOnly}
        disabled={disabled}
      />

      {isPix ? (
        <div
          className={cn(
            "rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2",
            "animate-in fade-in slide-in-from-top-1 duration-200",
          )}
        >
          <p className="text-sm font-medium text-foreground">Pix — CPF do titular</p>
          <p className="text-xs text-muted-foreground">
            Informe o CPF antes de gerar o QR Code (exigência do Asaas).
          </p>
          <Field
            id="pix-cpf"
            label="CPF"
            value={pixForm.cpfCnpj}
            onChange={(v) => onPixFormChange({ cpfCnpj: maskCpfInput(v) })}
            placeholder="000.000.000-00"
            inputMode="numeric"
            disabled={disabled}
          />
        </div>
      ) : (
        <div
          className={cn(
            "rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4",
            "animate-in fade-in slide-in-from-top-1 duration-200",
          )}
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              Cartão — dados do titular
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Preencha tudo aqui; a cobrança é enviada direto ao Asaas, sem abrir outra
              tela.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="card-cpf"
              label="CPF"
              value={cardForm.holderInfo.cpfCnpj}
              onChange={(v) =>
                onCardFormChange({
                  ...cardForm,
                  holderInfo: {
                    ...cardForm.holderInfo,
                    cpfCnpj: maskCpfInput(v),
                  },
                })
              }
              placeholder="000.000.000-00"
              inputMode="numeric"
              disabled={disabled}
            />
            <Field
              id="card-name"
              label="Nome completo"
              value={cardForm.holderInfo.name}
              onChange={(v) =>
                onCardFormChange({
                  ...cardForm,
                  holderInfo: { ...cardForm.holderInfo, name: v },
                  card: { ...cardForm.card, holderName: v },
                })
              }
              placeholder="Como no documento"
              disabled={disabled}
            />
            <Field
              id="card-email"
              label="E-mail"
              type="email"
              value={cardForm.holderInfo.email}
              onChange={(v) =>
                onCardFormChange({
                  ...cardForm,
                  holderInfo: { ...cardForm.holderInfo, email: v },
                })
              }
              placeholder="seu@email.com"
              disabled={disabled}
              className="sm:col-span-2"
            />
            <Field
              id="card-cep"
              label="CEP"
              value={cardForm.holderInfo.postalCode}
              onChange={(v) =>
                onCardFormChange({
                  ...cardForm,
                  holderInfo: {
                    ...cardForm.holderInfo,
                    postalCode: maskCepInput(v),
                  },
                })
              }
              placeholder="00000-000"
              inputMode="numeric"
              disabled={disabled}
            />
            <Field
              id="card-number-addr"
              label="Número do endereço"
              value={cardForm.holderInfo.addressNumber}
              onChange={(v) =>
                onCardFormChange({
                  ...cardForm,
                  holderInfo: { ...cardForm.holderInfo, addressNumber: v },
                })
              }
              placeholder="123"
              disabled={disabled}
            />
            <Field
              id="card-phone"
              label="Celular (DDD + número)"
              value={cardForm.holderInfo.phone}
              onChange={(v) =>
                onCardFormChange({
                  ...cardForm,
                  holderInfo: {
                    ...cardForm.holderInfo,
                    phone: maskPhoneBillingInput(v),
                  },
                })
              }
              placeholder="(31) 99999-9999"
              inputMode="tel"
              disabled={disabled}
              className="sm:col-span-2"
            />
          </div>

          <div className="border-t border-white/10 pt-3 space-y-3">
            <p className="text-sm font-medium text-foreground">Dados do cartão</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                id="card-pan"
                label="Número do cartão"
                value={cardForm.card.number}
                onChange={(v) =>
                  onCardFormChange({
                    ...cardForm,
                    card: { ...cardForm.card, number: maskCardNumberInput(v) },
                  })
                }
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                disabled={disabled}
                className="sm:col-span-2"
              />
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="card-exp">
                  Validade (MM/AA)
                </label>
                <Input
                  id="card-exp"
                  value={expiryDisplay}
                  onChange={(e) => {
                    const masked = maskCardExpiryInput(e.target.value);
                    setExpiryDisplay(masked);
                    const parsed = parseCardExpiry(masked);
                    onCardFormChange({
                      ...cardForm,
                      card: {
                        ...cardForm.card,
                        expiryMonth: parsed?.month ?? "",
                        expiryYear: parsed?.year ?? "",
                      },
                    });
                  }}
                  placeholder="12/28"
                  inputMode="numeric"
                  disabled={disabled}
                  className="mt-1"
                  autoComplete="off"
                />
              </div>
              <Field
                id="card-ccv"
                label="CVV"
                value={cardForm.card.ccv}
                onChange={(v) =>
                  onCardFormChange({
                    ...cardForm,
                    card: {
                      ...cardForm.card,
                      ccv: v.replace(/\D/g, "").slice(0, 4),
                    },
                  })
                }
                placeholder="123"
                inputMode="numeric"
                disabled={disabled}
              />
              <Field
                id="card-holder"
                label="Nome impresso no cartão"
                value={cardForm.card.holderName}
                onChange={(v) =>
                  onCardFormChange({
                    ...cardForm,
                    card: { ...cardForm.card, holderName: v },
                  })
                }
                placeholder="Como no cartão"
                disabled={disabled}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
