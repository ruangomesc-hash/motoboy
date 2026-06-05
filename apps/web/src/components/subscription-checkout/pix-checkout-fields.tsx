"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { cpfDigits, maskCpfInput } from "@/lib/cpf-mask";
import { isValidCpfDigits } from "@/lib/asaas-checkout";
import type { UserProfile } from "@motoboy/types";

export type PixCheckoutForm = {
  cpfCnpj: string;
};

export function buildDefaultPixForm(profile: UserProfile | null): PixCheckoutForm {
  return {
    cpfCnpj: profile?.cpfCnpj ? maskCpfInput(profile.cpfCnpj) : "",
  };
}

export function isPixFormValid(form: PixCheckoutForm): boolean {
  const digits = cpfDigits(form.cpfCnpj);
  return digits.length === 11 && isValidCpfDigits(digits);
}

export function pixFormToPayload(form: PixCheckoutForm) {
  return { cpfCnpj: cpfDigits(form.cpfCnpj) };
}

export function pixValidationHint(form: PixCheckoutForm): string | null {
  if (isPixFormValid(form)) return null;
  const d = form.cpfCnpj.replace(/\D/g, "");
  if (d.length < 11) {
    return "Informe o CPF completo (11 dígitos) para gerar o Pix.";
  }
  return "CPF inválido. Confira os números.";
}

type Props = {
  form: PixCheckoutForm;
  onChange: (next: PixCheckoutForm) => void;
  disabled?: boolean;
};

export function PixCheckoutFields({ form, onChange, disabled = false }: Props) {
  return (
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
      <div>
        <label className="text-sm text-muted-foreground" htmlFor="pix-cpf">
          CPF
        </label>
        <Input
          id="pix-cpf"
          value={form.cpfCnpj}
          onChange={(e) => onChange({ cpfCnpj: maskCpfInput(e.target.value) })}
          placeholder="000.000.000-00"
          inputMode="numeric"
          disabled={disabled}
          className="mt-1"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
