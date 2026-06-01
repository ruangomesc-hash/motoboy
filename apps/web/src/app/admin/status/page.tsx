"use client";

import { useCallback, useEffect, useState } from "react";
import type { IntegrationsHealthReport } from "@motoboy/types";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminApi } from "@/hooks/use-admin-api";
import {
  fetchSystemHealth,
  isSystemHealthy,
  type SystemHealthSnapshot,
} from "@/lib/system-health";
import {
  formatTokenBudget,
  integrationStatusLabel,
  tokenBudgetPercent,
} from "@/lib/integrations-health";
import { cn } from "@/lib/utils";
import {
  Activity,
  Bot,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  XCircle,
  CreditCard,
  KeyRound,
  Table2,
  Radio,
} from "lucide-react";

function boolLabel(v: boolean | undefined): string {
  if (v === undefined) return "—";
  return v ? "Sim" : "Não";
}

function statusTone(
  ok: boolean | undefined,
): "success" | "danger" | "warning" | "default" {
  if (ok === undefined) return "default";
  return ok ? "success" : "danger";
}

function formatCheckedAt(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          "text-sm text-right break-all",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function statusBadgeClass(
  status: IntegrationsHealthReport["integrations"][number]["status"],
): string {
  if (status === "ok") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "degraded") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (status === "rate_limited") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (status === "error") return "bg-red-500/15 text-red-400 border-red-500/30";
  return "bg-white/5 text-muted-foreground border-white/10";
}

export default function AdminStatusPage() {
  const api = useAdminApi();
  const [snapshot, setSnapshot] = useState<SystemHealthSnapshot | null>(null);
  const [integrations, setIntegrations] =
    useState<IntegrationsHealthReport | null>(null);
  const [integrationsError, setIntegrationsError] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setIntegrationsError(null);
    const [healthData, integrationsResult] = await Promise.all([
      fetchSystemHealth(),
      api<IntegrationsHealthReport>("/admin/integrations/health").catch(
        (err: Error) => {
          setIntegrationsError(err.message);
          return null;
        },
      ),
    ]);
    setSnapshot(healthData);
    setIntegrations(integrationsResult);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      void load();
    }, 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const healthy = snapshot ? isSystemHealthy(snapshot) : false;
  const h = snapshot?.health;

  const aiRows = integrations?.integrations.filter((r) =>
    r.id.startsWith("openai-"),
  );
  const aiOk =
    aiRows?.every((r) => r.status === "ok" || r.status === "not_configured") ??
    false;
  const aiLimited = aiRows?.some((r) => r.status === "rate_limited") ?? false;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            Status do sistema
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Infra, integrações e IAs — tokens e conectividade em tempo real
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs border transition-colors",
              autoRefresh
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-border text-muted-foreground",
            )}
          >
            Auto 60s {autoRefresh ? "on" : "off"}
          </button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {snapshot && (
        <div
          className={cn(
            "rounded-xl border p-4 flex items-start gap-3",
            healthy && !aiLimited
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10",
          )}
        >
          {healthy && !aiLimited ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-amber-400 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold">
              {healthy && aiOk && !aiLimited
                ? "Sistema operacional"
                : "Atenção — revise infra ou IAs"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Última verificação: {formatCheckedAt(snapshot.checkedAt)}
              {snapshot.httpStatus != null && (
                <> · HTTP {snapshot.httpStatus}</>
              )}
              {snapshot.latencyMs > 0 && (
                <> · {snapshot.latencyMs} ms</>
              )}
            </p>
            {snapshot.fetchError && (
              <p className="text-sm text-destructive mt-2">{snapshot.fetchError}</p>
            )}
            {integrationsError && (
              <p className="text-sm text-destructive mt-2">
                IAs: {integrationsError}
              </p>
            )}
            {h?.migrationsHint && (
              <p className="text-sm text-amber-400 mt-2">{h.migrationsHint}</p>
            )}
          </div>
        </div>
      )}

      {!snapshot && loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Consultando serviços…
        </p>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          label="API (health)"
          value={h?.ok ? "OK" : h ? "Falha" : "—"}
          hint={
            snapshot?.latencyMs
              ? `${snapshot.latencyMs} ms`
              : undefined
          }
          icon={Server}
          tone={statusTone(h?.ok)}
        />
        <StatCard
          label="Liveness"
          value={snapshot?.live?.ok ? "OK" : snapshot?.live === null ? "—" : "Falha"}
          hint={
            snapshot?.liveLatencyMs != null
              ? `${snapshot.liveLatencyMs} ms · /health/live`
              : "/health/live"
          }
          icon={Radio}
          tone={statusTone(snapshot?.live?.ok)}
        />
        <StatCard
          label="Banco (Supabase)"
          value={
            h?.database === "connected"
              ? "Conectado"
              : h?.database ?? "—"
          }
          icon={Database}
          tone={statusTone(h?.database === "connected")}
        />
        <StatCard
          label="IAs (OpenAI)"
          value={
            aiLimited
              ? "Limite"
              : aiRows?.every((r) => r.status === "ok")
                ? "OK"
                : aiRows?.some((r) => r.status === "error")
                  ? "Erro"
                  : "—"
          }
          hint={
            integrations
              ? formatCheckedAt(integrations.checkedAt)
              : "Aguardando probe"
          }
          icon={Bot}
          tone={
            aiLimited
              ? "danger"
              : aiRows?.every((r) => r.status === "ok")
                ? "success"
                : "warning"
          }
        />
      </section>

      {integrations && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2 px-1">
            <Bot className="h-4 w-4 text-emerald-400" />
            IAs e integrações conectadas
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {integrations.integrations.map((row) => {
              const tokenPct = tokenBudgetPercent(row);
              const tokenLabel = formatTokenBudget(row);
              return (
                <div
                  key={row.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{row.label}</p>
                      {row.model && (
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {row.model}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {row.role}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                        statusBadgeClass(row.status),
                      )}
                    >
                      {integrationStatusLabel(row.status)}
                    </span>
                  </div>
                  {row.message && (
                    <p className="text-xs text-muted-foreground">{row.message}</p>
                  )}
                  {row.latencyMs != null && (
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      Latência: {row.latencyMs} ms
                    </p>
                  )}
                  {tokenLabel && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Tokens (janela RPM)</span>
                        <span className="tabular-nums">{tokenLabel}</span>
                      </div>
                      {tokenPct != null && (
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              tokenPct < 10
                                ? "bg-red-500"
                                : tokenPct < 25
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                            )}
                            style={{ width: `${tokenPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {row.rateLimit?.remainingRequests != null &&
                    row.rateLimit.limitRequests != null && (
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        Requisições: {row.rateLimit.remainingRequests} /{" "}
                        {row.rateLimit.limitRequests}
                      </p>
                    )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Table2 className="h-4 w-4 text-emerald-400" />
            Banco e migrations
          </h2>
          <DetailRow label="Database" value={h?.database ?? "—"} />
          <DetailRow label="Tabela admin" value={boolLabel(h?.adminTable)} />
          <DetailRow
            label="Coluna senha (User.passwordHash)"
            value={boolLabel(h?.userPasswordColumn)}
          />
          <DetailRow
            label="Migrations pendentes"
            value={h?.migrationsHint ?? "Nenhuma"}
          />
          <DetailRow label="Redis (fila WhatsApp)" value={boolLabel(h?.redis)} />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            Asaas (pagamentos)
          </h2>
          <DetailRow
            label="Integração configurada"
            value={boolLabel(h?.asaas?.configured)}
          />
          <DetailRow label="Sandbox" value={boolLabel(h?.asaas?.sandbox)} />
          <DetailRow label="Webhook" value={h?.asaas?.webhook ?? "—"} mono />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-400" />
          Endpoints monitorados
        </h2>
        <DetailRow label="Health completo" value="/api/backend/health" mono />
        <DetailRow
          label="IAs (admin)"
          value="/api/backend/admin/integrations/health"
          mono
        />
        <DetailRow
          label="Liveness (Railway)"
          value="/api/backend/health/live"
          mono
        />
      </section>

      {(h || integrations) && (
        <section className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resposta bruta (JSON)
            </p>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-200/90 max-h-96">
            {JSON.stringify({ health: h, integrations }, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
