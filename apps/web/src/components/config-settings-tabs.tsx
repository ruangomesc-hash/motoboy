"use client";

import { cn } from "@/lib/utils";
import { CreditCard, User } from "lucide-react";

export type ConfigSettingsTab = "perfil" | "pagamento";

const TABS: {
  id: ConfigSettingsTab;
  label: string;
  icon: typeof User;
}[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "pagamento", label: "Pagamento", icon: CreditCard },
];

type Props = {
  active: ConfigSettingsTab;
  onChange: (tab: ConfigSettingsTab) => void;
};

export function ConfigSettingsTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Seções de configurações"
      className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/60"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
              selected
                ? "bg-primary/15 text-primary border border-primary/40 shadow-sm"
                : "text-muted-foreground border border-transparent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
