"use client";

import { useEffect, useMemo, useState } from "react";
import type { PeriodStats } from "@motoboy/types";
import { useAppData } from "@/components/app-data-provider";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";
import { AppPage } from "@/components/app-page";
import { buildPreviewPeriodStats } from "@/lib/stats-preview";

function mergeDisplayStats(
  api: PeriodStats | null,
  preview: PeriodStats,
  deliveryCount: number,
): PeriodStats {
  if (!api) return { ...preview, count: deliveryCount };
  const usePreviewGross = preview.totalGross > api.totalGross + 0.001;
  return {
    ...api,
    count: deliveryCount,
    totalGross: usePreviewGross
      ? Math.max(api.totalGross, preview.totalGross)
      : api.totalGross,
    totalNet: usePreviewGross
      ? Math.max(api.totalNet, preview.totalNet)
      : api.totalNet,
    totalKm: Math.max(api.totalKm, preview.totalKm),
    series: preview.series.length > 0 ? preview.series : api.series,
  };
}

export default function StatsPage() {
  const {
    statsWeek,
    statsMonth,
    refreshStats,
    today,
    deliveries,
  } = useAppData();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const apiStats: PeriodStats | null =
    period === "week" ? statsWeek : statsMonth;

  const preview = useMemo(
    () =>
      buildPreviewPeriodStats(
        period,
        deliveries,
        today,
        apiStats,
      ),
    [period, deliveries, today, apiStats],
  );

  const deliveryCount = preview.count;

  const stats = useMemo(
    () => mergeDisplayStats(apiStats, preview, deliveryCount),
    [apiStats, preview, deliveryCount],
  );

  useEffect(() => {
    void refreshStats("week");
    void refreshStats("month");
  }, [refreshStats]);

  const max = Math.max(...(stats.series.map((s) => s.gross) ?? [1]), 1);

  return (
    <AppPage className="p-3 space-y-3">
      <h1 className="text-lg font-bold px-1">Estatísticas</h1>

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

      {stats.series.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 w-full max-w-full min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground mb-3">
            Faturamento por dia
          </p>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain -mx-0.5 px-0.5">
            <div
              className="flex items-end gap-0.5 h-32 min-w-0"
              style={{
                minWidth: `${Math.max(stats.series.length * 10, 100)}px`,
              }}
            >
              {stats.series.map((s) => (
                <div
                  key={s.date}
                  className="flex-1 min-w-[6px] max-w-[20px] bg-primary rounded-t"
                  style={{ height: `${(s.gross / max) * 100}%` }}
                  title={`${s.date}: ${formatBRL(s.gross)}`}
                />
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
