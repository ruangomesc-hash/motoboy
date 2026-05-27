"use client";

import type { WeeklyGoalProgress } from "@motoboy/types";
import { formatBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Target, TrendingDown, TrendingUp, Minus } from "lucide-react";

type DailyGoal = {
  target: number;
  remaining: number;
  progress: number;
};

function HorizontalBar({
  fillPct,
  expectedPct,
  barClass,
  label,
}: {
  fillPct: number;
  expectedPct?: number;
  barClass: string;
  label: string;
}) {
  const fill = Math.min(fillPct, 100);
  const expected =
    expectedPct != null ? Math.min(expectedPct, 100) : undefined;

  return (
    <div
      className="relative h-1.5 w-full rounded-full bg-muted/40 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(fill)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
          barClass,
        )}
        style={{ width: `${fill}%` }}
      />
      {expected != null && (
        <div
          className="absolute top-0 bottom-0 w-px bg-white/60"
          style={{ left: `${expected}%` }}
          title="Ritmo esperado"
        />
      )}
    </div>
  );
}

export function WeeklyGoalThermometer({
  weekly,
  daily,
}: {
  weekly?: WeeklyGoalProgress | null;
  daily?: DailyGoal | null;
}) {
  if (!weekly && !daily) return null;

  const paceConfig = weekly
    ? {
        ahead: {
          icon: TrendingUp,
          label: "Adiantado",
          className: "text-emerald-400",
          bar: "bg-emerald-500",
        },
        behind: {
          icon: TrendingDown,
          label: "Atrasado",
          className: "text-amber-400",
          bar: "bg-amber-500",
        },
        on_track: {
          icon: Minus,
          label: "No ritmo",
          className: "text-muted-foreground",
          bar: "bg-primary",
        },
      }[weekly.pace]
    : null;

  const PaceIcon = paceConfig?.icon;
  const weeklyFill = weekly ? Math.min(weekly.progress * 100, 100) : 0;
  const weeklyExpected = weekly
    ? Math.min(weekly.expectedProgress * 100, 100)
    : undefined;

  const dailyPercent = daily
    ? Math.round(Math.min(daily.progress * 100, 100))
    : 0;

  return (
    <section className="rounded-lg border border-border/80 bg-card/90 px-2.5 py-1.5 space-y-1.5 w-full max-w-full min-w-0 overflow-hidden">
      {weekly && paceConfig && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1 text-[9px] leading-tight min-w-0">
            <span className="text-muted-foreground uppercase tracking-wide font-medium shrink-0">
              Semana
            </span>
            <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium shrink-0",
                  paceConfig.className,
                )}
              >
                {PaceIcon && <PaceIcon className="h-2.5 w-2.5" strokeWidth={2} />}
                {paceConfig.label}
              </span>
              <span className="font-bold tabular-nums text-[10px] text-foreground truncate">
                {formatBRL(weekly.earned)}
                <span className="text-muted-foreground font-normal">
                  {" "}
                  / {formatBRL(weekly.target)}
                </span>
              </span>
            </div>
          </div>
          <HorizontalBar
            fillPct={weeklyFill}
            expectedPct={weeklyExpected}
            barClass={paceConfig.bar}
            label="Progresso da meta semanal"
          />
        </div>
      )}

      {weekly && daily && <div className="border-t border-border/40" />}

      {daily && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1.5 text-[9px] text-muted-foreground leading-tight">
            <span className="flex items-center gap-0.5 min-w-0 truncate">
              <Target className="h-2.5 w-2.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">
                Dia · faltam {formatBRL(daily.remaining)}
              </span>
            </span>
            <span className="shrink-0 tabular-nums font-semibold text-foreground">
              {dailyPercent}%
            </span>
          </div>
          <HorizontalBar
            fillPct={dailyPercent}
            barClass="bg-emerald-500"
            label="Progresso da meta do dia"
          />
        </div>
      )}
    </section>
  );
}
