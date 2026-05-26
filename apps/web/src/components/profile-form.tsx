"use client";

import { User } from "lucide-react";
import type { DeliverySource, SubscriptionPaymentMethod } from "@motocheck/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SUBSCRIPTION_PAYMENT_OPTIONS,
  WORK_APP_OPTIONS,
} from "@/lib/profile-options";
import { WorkDaysPicker } from "@/components/work-days-picker";

export interface ProfileFormState {
  name: string;
  email: string;
  city: string;
  workApps: DeliverySource[];
  subscriptionPaymentMethod: SubscriptionPaymentMethod;
  workDays: number[];
}

export function ProfileForm({
  value,
  onChange,
}: {
  value: ProfileFormState;
  onChange: (next: ProfileFormState) => void;
}) {
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
        <p className="text-sm text-muted-foreground mb-2">
          Como pagar a assinatura Motocopiloto
        </p>
        <ChipGroup
          options={SUBSCRIPTION_PAYMENT_OPTIONS}
          selected={value.subscriptionPaymentMethod}
          onSelect={(id) => onChange({ ...value, subscriptionPaymentMethod: id })}
          single
        />
        <p className="text-xs text-muted-foreground mt-2">
          R$ 14,90/mês após o trial. Usado na hora de assinar em Config ou na tela
          Assinar.
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
