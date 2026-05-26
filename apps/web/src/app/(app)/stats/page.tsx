"use client";

import { useCallback, useEffect, useState } from "react";
import type { PeriodStats } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";
import { formatHours } from "@/lib/format-hours";

export default function StatsPage() {
  const api = useApi();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [stats, setStats] = useState<PeriodStats | null>(null);
  const [shiftLoading, setShiftLoading] = useState(false);

  const load = useCallback(() => {
    api<PeriodStats>(`/me/stats?period=${period}`)
      .then(setStats)
      .catch(() => setStats(null));
  }, [api, period]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleShift() {
    setShiftLoading(true);
    try {
      if (stats?.activeShift) {
        await api("/me/shifts/end", { method: "POST" });
      } else {
        await api("/me/shifts/start", { method: "POST" });
      }
      load();
    } finally {
      setShiftLoading(false);
    }
  }

  const max = Math.max(...(stats?.series.map((s) => s.gross) ?? [1]), 1);

  return (
    <div className="p-3 space-y-3">
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

      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
        <p className="text-xs text-muted-foreground">Controle de horas</p>
        {stats?.activeShift ? (
          <p className="text-sm">
            Turno em andamento desde{" "}
            {new Date(stats.activeShift.startedAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Inicie o turno para contar horas trabalhadas
          </p>
        )}
        <Button
          variant={stats?.activeShift ? "outline" : "default"}
          size="sm"
          className="w-full"
          disabled={shiftLoading}
          onClick={toggleShift}
        >
          {shiftLoading
            ? "..."
            : stats?.activeShift
              ? "Encerrar turno"
              : "Iniciar turno"}
        </Button>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Total bruto" value={formatBRL(stats.totalGross)} />
            <StatCard label="Entregas" value={String(stats.count)} />
            <StatCard
              label="Horas trabalhadas"
              value={formatHours(stats.hoursWorked)}
              highlight
            />
            <StatCard
              label="Ganho / hora (bruto)"
              value={
                stats.grossPerHour != null
                  ? formatBRL(stats.grossPerHour)
                  : "—"
              }
              highlight
            />
            <StatCard
              label="Ganho / hora (líquido)"
              value={
                stats.netPerHour != null ? formatBRL(stats.netPerHour) : "—"
              }
              className="col-span-2"
            />
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
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-3">
                Faturamento por dia
              </p>
              <div className="flex items-end gap-1 h-32">
                {stats.series.map((s) => (
                  <div
                    key={s.date}
                    className="flex-1 bg-primary rounded-t min-w-[4px]"
                    style={{ height: `${(s.gross / max) * 100}%` }}
                    title={`${s.date}: ${formatBRL(s.gross)}`}
                  />
                ))}
              </div>
            </div>
          )}

          {stats.hoursWorked === 0 && (
            <p className="text-xs text-center text-muted-foreground px-2">
              Ganho/hora aparece quando você inicia e encerra turnos, ou registra
              turno pelo WhatsApp (&quot;começar turno&quot;).
            </p>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg border bg-card ${
        highlight ? "border-emerald-500/40" : "border-border"
      } ${className ?? ""}`}
    >
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      <p className="text-base font-bold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
