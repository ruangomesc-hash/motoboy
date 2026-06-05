"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@motoboy/types";
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

export function buildDefaultCardForm(profile: UserProfile | null): CardCheckoutForm {
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
      phone: phone
        ? maskPhoneBillingInput(phone.replace(/\D/g, "").slice(-11))
        : "",
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

export function cardValidationHint(): string {
  return "Preencha todos os dados do titular e do cartão.";
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

type Props = {
  form: CardCheckoutForm;
  onChange: (next: CardCheckoutForm) => void;
  disabled?: boolean;
};

export function CardCheckoutFields({ form, onChange, disabled = false }: Props) {
  const [expiryDisplay, setExpiryDisplay] = useState("");

  useEffect(() => {
    if (form.card.expiryMonth && form.card.expiryYear) {
      setExpiryDisplay(
        `${form.card.expiryMonth}/${form.card.expiryYear.slice(-2)}`,
      );
    }
  }, [form.card.expiryMonth, form.card.expiryYear]);

  return (
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
          value={form.holderInfo.cpfCnpj}
          onChange={(v) =>
            onChange({
              ...form,
              holderInfo: { ...form.holderInfo, cpfCnpj: maskCpfInput(v) },
            })
          }
          placeholder="000.000.000-00"
          inputMode="numeric"
          disabled={disabled}
        />
        <Field
          id="card-name"
          label="Nome completo"
          value={form.holderInfo.name}
          onChange={(v) =>
            onChange({
              ...form,
              holderInfo: { ...form.holderInfo, name: v },
              card: { ...form.card, holderName: v },
            })
          }
          placeholder="Como no documento"
          disabled={disabled}
        />
        <Field
          id="card-email"
          label="E-mail"
          type="email"
          value={form.holderInfo.email}
          onChange={(v) =>
            onChange({
              ...form,
              holderInfo: { ...form.holderInfo, email: v },
            })
          }
          placeholder="seu@email.com"
          disabled={disabled}
          className="sm:col-span-2"
        />
        <Field
          id="card-cep"
          label="CEP"
          value={form.holderInfo.postalCode}
          onChange={(v) =>
            onChange({
              ...form,
              holderInfo: {
                ...form.holderInfo,
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
          value={form.holderInfo.addressNumber}
          onChange={(v) =>
            onChange({
              ...form,
              holderInfo: { ...form.holderInfo, addressNumber: v },
            })
          }
          placeholder="123"
          disabled={disabled}
        />
        <Field
          id="card-phone"
          label="Celular (DDD + número)"
          value={form.holderInfo.phone}
          onChange={(v) =>
            onChange({
              ...form,
              holderInfo: {
                ...form.holderInfo,
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
            value={form.card.number}
            onChange={(v) =>
              onChange({
                ...form,
                card: { ...form.card, number: maskCardNumberInput(v) },
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
                onChange({
                  ...form,
                  card: {
                    ...form.card,
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
            value={form.card.ccv}
            onChange={(v) =>
              onChange({
                ...form,
                card: {
                  ...form.card,
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
            value={form.card.holderName}
            onChange={(v) =>
              onChange({
                ...form,
                card: { ...form.card, holderName: v },
              })
            }
            placeholder="Como no cartão"
            disabled={disabled}
            className="sm:col-span-2"
          />
        </div>
      </div>
    </div>
  );
}
