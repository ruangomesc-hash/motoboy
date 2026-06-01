"use client";

import { useEffect, useMemo, useState } from "react";
import type { DeliverySource, PeriodStats } from "@motoboy/types";
import { resolvePeriodRange } from "@motoboy/types";
import { useAppData } from "@/components/app-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";
import { AppPage } from "@/components/app-page";
import { buildPreviewPeriodStats } from "@/lib/stats-preview";
import { todayDateInputValue } from "@/lib/local-date";

const SOURCE_LABELS: Record<DeliverySource, string> = {
  IFOOD: "iFood",
  NINETY_NINE: "99",
  RAPPI: "Rappi",
  PARTICULAR: "Particular",
  OTHER: "Outro",
};

function mergeDisplayStats(
  api: PeriodStats | null,
  preview: PeriodStats,
): PeriodStats {
  if (!api) return preview;

  const usePreviewGross = preview.totalGross > api.totalGross + 0.001;
  const mergedBySource = api.bySource.length > 0 ? api.bySource : preview.bySource;
  const mergedExpenses =
    api.expenses.length > 0 ? api.expenses : preview.expenses;

  return {
    ...api,
    count: Math.max(api.count, preview.count),
    totalGross: usePreviewGross
      ? Math.max(api.totalGross, preview.totalGross)
      : api.totalGross,
    totalNet: usePreviewGross
      ? Math.max(api.totalNet, preview.totalNet)
      : api.totalNet,
    totalKm: Math.max(api.totalKm, preview.totalKm),
    totalExpenses: Math.max(api.totalExpenses, preview.totalExpenses),
    series: preview.series.length > 0 ? preview.series : api.series,
    bySource: mergedBySource,
    expenses: mergedExpenses,
  };
}

function formatChartDay(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

export default function StatsPage() {
  const {
    statsWeek,
    statsMonth,
    refreshStats,
    today,
    deliveries,
    deliveriesDate,
    setDeliveriesDate,
    syncDeliveriesFilterDate,
  } = useAppData();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const deviceToday = todayDateInputValue();
  const filterDate = deliveriesDate || deviceToday;
  const isToday = filterDate === deviceToday;

  useEffect(() => {
    syncDeliveriesFilterDate();
  }, [syncDeliveriesFilterDate]);

  const apiStats: PeriodStats | null =
    period === "week" ? statsWeek : statsMonth;

  const preview = useMemo(
    () =>
      buildPreviewPeriodStats(
        period,
        deliveries,
        today,
        apiStats,
        filterDate,
      ),
    [period, deliveries, today, apiStats, filterDate],
  );

  const stats = useMemo(
    () => mergeDisplayStats(apiStats, preview),
    [apiStats, preview],
  );

  const rangeMeta = useMemo(
    () => resolvePeriodRange(period, filterDate),
    [period, filterDate],
  );

  useEffect(() => {
    void refreshStats("week");
    void refreshStats("month");
  }, [refreshStats]);

  const max = Math.max(...(stats.series.map((s) => s.gross) ?? [1]), 1);
  const maxSource = Math.max(...stats.bySource.map((s) => s.gross), 1);
  const maxExpense = Math.max(...stats.expenses.map((e) => e.amount), 1);

  return (
    <AppPage className="p-3 space-y-3 pb-4">
      <div className="px-1">
        <h1 className="text-lg font-bold">Estatísticas</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {rangeMeta.title} · {rangeMeta.subtitle}
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground px-1">
          Data de referência (sincronizada com Entregas)
        </label>
        <Input
          type="date"
          value={filterDate}
          max={deviceToday}
          onChange={(e) => setDeliveriesDate(e.target.value)}
        />
        {!isToday && (
          <button
            type="button"
            className="text-xs text-primary underline px-1"
            onClick={() => setDeliveriesDate(deviceToday)}
          >
            Voltar para hoje ({deviceToday.split("-").reverse().join("/")})
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={period === "week" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => setPeriod("week")}
        >
          Semana
        </Button>
        <Button
          variant={period === "month" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => setPeriod("month")}
        >
          Mês
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total bruto" value={formatBRL(stats.totalGross)} />
        <StatCard label="Entregas" value={String(stats.count)} />
        <StatCard
          label="Líquido no período"
          value={formatBRL(stats.totalNet)}
        />
        <StatCard
          label="Km rodados"
          value={`${stats.totalKm.toFixed(0)} km`}
        />
      </div>

      {stats.bySource.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-3 space-y-2">
          <p className="text-xs font-medium">Receita por origem</p>
          <ul className="space-y-2">
            {stats.bySource.map((row) => (
              <li key={row.source} className="space-y-1">
                <div className="flex justify-between text-[11px] gap-2">
                  <span className="text-muted-foreground">
                    {SOURCE_LABELS[row.source]}
                  </span>
                  <span className="tabular-nums shrink-0">
                    {formatBRL(row.gross)} · {row.count} entrega
                    {row.count !== 1 ? "s" : ""}
                    {row.km > 0 ? ` · ${row.km.toFixed(0)} km` : ""}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(row.gross / maxSource) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.expenses.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-3 space-y-2">
          <div className="flex justify-between items-baseline gap-2">
            <p className="text-xs font-medium">Principais despesas</p>
            <p className="text-[11px] text-red-400 tabular-nums">
              −{formatBRL(stats.totalExpenses)}
            </p>
          </div>
          <ul className="space-y-2">
            {stats.expenses.slice(0, 6).map((row) => (
              <li key={row.key} className="space-y-1">
                <div className="flex justify-between text-[11px] gap-2">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-red-400 tabular-nums shrink-0">
                    −{formatBRL(row.amount)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-red-500/70 rounded-full"
                    style={{ width: `${(row.amount / maxExpense) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.series.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 w-full max-w-full min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground mb-3">
            Faturamento por dia
          </p>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain -mx-0.5 px-0.5">
            <div
              className="flex items-end gap-1 h-32 min-w-0"
              style={{
                minWidth: `${Math.max(stats.series.length * 28, 100)}px`,
              }}
            >
              {stats.series.map((s) => (
                <div
                  key={s.date}
                  className="flex flex-col items-center flex-1 min-w-[24px] max-w-[32px] gap-1"
                >
                  <div
                    className="w-full bg-primary rounded-t min-h-[4px]"
                    style={{
                      height: `${Math.max((s.gross / max) * 100, 4)}%`,
                    }}
                    title={`${s.date}: ${formatBRL(s.gross)}`}
                  />
                  <span className="text-[8px] text-muted-foreground tabular-nums">
                    {formatChartDay(s.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppPage>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg border border-border bg-card min-w-0 overflow-hidden ${className ?? ""}`}
    >
      <p className="text-[10px] text-muted-foreground leading-tight break-words">
        {label}
      </p>
      <p className="text-sm sm:text-base font-bold tabular-nums mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}
