"use client";

import type { ActivityLogItem } from "@motocheck/types";
import {
  Fuel,
  Gauge,
  Package,
  Settings,
  Target,
  User,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<ActivityLogItem["category"], LucideIcon> = {
  PROFILE: User,
  COSTS: Settings,
  GOAL: Target,
  DELIVERY: Package,
  FUEL: Fuel,
  ODOMETER: Gauge,
  SHIFT: Gauge,
};

const ACTION_STYLES: Record<ActivityLogItem["action"], string> = {
  CREATED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UPDATED: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  DELETED: "bg-red-500/10 text-red-400 border-red-500/25",
};

const ACTION_LABELS: Record<ActivityLogItem["action"], string> = {
  CREATED: "Novo",
  UPDATED: "Alterado",
  DELETED: "Removido",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (d >= startToday) return `Hoje · ${time}`;
  if (d >= startYesterday) return `Ontem · ${time}`;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(items: ActivityLogItem[]): { label: string; items: ActivityLogItem[] }[] {
  const groups = new Map<string, ActivityLogItem[]>();
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  for (const item of items) {
    const d = new Date(item.createdAt);
    let label: string;
    if (d >= startToday) label = "Hoje";
    else if (d >= startYesterday) label = "Ontem";
    else {
      label = d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
    const list = groups.get(label) ?? [];
    list.push(item);
    groups.set(label, list);
  }

  return Array.from(groups.entries()).map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }));
}

export function ActivityTimeline({ items }: { items: ActivityLogItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12 px-4">
        Nenhuma alteração registrada ainda. Quando você salvar configurações ou
        registrar entregas, aparece aqui o que mudou.
      </p>
    );
  }

  const groups = groupByDay(items);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            {group.label}
          </p>
          <ol className="relative border-l border-border/60 ml-3 space-y-4">
            {group.items.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function TimelineItem({ item }: { item: ActivityLogItem }) {
  const Icon = CATEGORY_ICONS[item.category];
  const SourceIcon = item.source === "whatsapp" ? MessageCircle : Smartphone;

  return (
    <li className="relative pl-6">
      <span
        className={cn(
          "absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background",
          item.action === "CREATED" && "bg-emerald-500",
          item.action === "UPDATED" && "bg-amber-500",
          item.action === "DELETED" && "bg-red-500",
        )}
        aria-hidden
      />
      <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                  ACTION_STYLES[item.action],
                )}
              >
                {ACTION_LABELS[item.action]}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <SourceIcon className="h-3 w-3 shrink-0" />
              {formatWhen(item.createdAt)}
              {item.source === "whatsapp" ? " · WhatsApp" : " · App"}
            </p>
          </div>
        </div>

        {item.changes.length > 0 && (
          <ul className="space-y-1.5 pt-1 border-t border-border/40">
            {item.changes.map((change) => (
              <li key={`${item.id}-${change.field}`} className="text-xs">
                <span className="text-muted-foreground">{change.label}: </span>
                {item.action === "CREATED" ? (
                  <span className="text-foreground font-medium">{change.to}</span>
                ) : item.action === "DELETED" ? (
                  <span className="text-muted-foreground line-through">
                    {change.from}
                  </span>
                ) : (
                  <span>
                    <span className="text-muted-foreground line-through">
                      {change.from}
                    </span>
                    <span className="text-muted-foreground mx-1">→</span>
                    <span className="text-foreground font-medium">{change.to}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
