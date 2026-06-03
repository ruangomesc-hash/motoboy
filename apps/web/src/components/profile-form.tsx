"use client";

import { User, MessageCircle } from "lucide-react";
import type { DeliverySource, SubscriptionPaymentMethod } from "@motoboy/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { maskPhone, formatPhoneDisplay } from "@/lib/phone-mask";
import {
  SUBSCRIPTION_PAYMENT_OPTIONS_UI,
  WORK_APP_OPTIONS,
} from "@/lib/profile-options";
import Link from "next/link";
import { WorkDaysPicker } from "@/components/work-days-picker";

export interface ProfileFormState {
  name: string;
  email: string;
  /** 11 dígitos locais com máscara (DDD + 9 + número). */
  whatsappPhone: string;
  city: string;
  workApps: DeliverySource[];
  subscriptionPaymentMethod: SubscriptionPaymentMethod;
  workDays: number[];
}

export function ProfileForm({
  value,
  onChange,
  storedWhatsApp,
}: {
  value: ProfileFormState;
  onChange: (next: ProfileFormState) => void;
  /** Número salvo no servidor (55 + 11 dígitos) — exibido mesmo antes do input sincronizar. */
  storedWhatsApp?: string | null;
}) {
  const registeredLabel =
    storedWhatsApp?.trim() && formatPhoneDisplay(storedWhatsApp);
  const inputLabel =
    value.whatsappPhone.replace(/\D/g, "").length === 11
      ? formatPhoneDisplay(value.whatsappPhone)
      : null;
  const showRegistered =
    registeredLabel &&
    (!inputLabel || registeredLabel.replace(/\D/g, "") === inputLabel.replace(/\D/g, ""));

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <User className="h-4 w-4" strokeWidth={1.75} />
        Perfil
      </h2>

      <Field
        label="Nome"
        value={value.name}
        onChange={(name) => onChange({ ...value, name })}
        placeholder="Como você quer ser chamado"
      />
      <Field
        label="E-mail"
        value={value.email}
        onChange={(email) => onChange({ ...value, email })}
        placeholder="seu@email.com"
        type="email"
      />
      <div>
        <label className="text-sm text-muted-foreground flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
          WhatsApp
        </label>
        {showRegistered ? (
          <p className="mt-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Número cadastrado: </span>
            <span className="font-semibold text-foreground tabular-nums">
              {registeredLabel}
            </span>
          </p>
        ) : registeredLabel ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Cadastrado no app:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {registeredLabel}
            </span>
          </p>
        ) : null}
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={value.whatsappPhone}
          onChange={(e) =>
            onChange({ ...value, whatsappPhone: maskPhone(e.target.value) })
          }
          placeholder="(31) 99999-8888"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {showRegistered
            ? "Deve ser o mesmo número do login (Entrar / Cadastro) e do celular que manda mensagem no Zap."
            : "Mesmo número do login e do Zap (11 dígitos, com 9 após o DDD). Salve em Configurações após o cadastro."}
        </p>
      </div>
      <Field
        label="Cidade (opcional)"
        value={value.city}
        onChange={(city) => onChange({ ...value, city })}
        placeholder="São Paulo"
      />

      <div>
        <p className="text-sm text-muted-foreground mb-2">Apps que você trabalha</p>
        <ChipGroup
          options={WORK_APP_OPTIONS}
          selected={value.workApps}
          onToggle={(id) =>
            onChange({
              ...value,
              workApps: toggleInList(value.workApps, id),
            })
          }
        />
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Dias que você trabalha</p>
        <WorkDaysPicker
          value={value.workDays}
          onChange={(workDays) => onChange({ ...value, workDays })}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Usado no calendário real para dividir meta mensal em semana e dia.
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Forma de pagamento</p>
        <ChipGroup
          options={SUBSCRIPTION_PAYMENT_OPTIONS_UI}
          selected={value.subscriptionPaymentMethod}
          onSelect={(id) => onChange({ ...value, subscriptionPaymentMethod: id })}
          single
        />
        <p className="text-xs text-muted-foreground mt-2">
          R$ 15,90/mês · Acesso completo. Salve aqui e conclua o pagamento em{" "}
          <Link href="/assinar" className="text-primary underline-offset-2 hover:underline">
            Assinar
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
}

function ChipGroup<T extends string>({
  options,
  selected,
  onToggle,
  onSelect,
  single = false,
}: {
  options: { id: T; label: string; hint?: string }[];
  selected: T | T[];
  onToggle?: (id: T) => void;
  onSelect?: (id: T) => void;
  single?: boolean;
}) {
  const isActive = (id: T) =>
    single ? selected === id : (selected as T[]).includes(id);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = isActive(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.hint}
            onClick={() =>
              single ? onSelect?.(opt.id) : onToggle?.(opt.id)
            }
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              active
                ? "bg-primary/15 border-primary text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function toggleInList<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
