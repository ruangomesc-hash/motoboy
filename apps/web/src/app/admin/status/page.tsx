"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import {
  fetchSystemHealth,
  isSystemHealthy,
  type SystemHealthSnapshot,
} from "@/lib/system-health";
import { cn } from "@/lib/utils";
import {
  Activity,
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

export default function AdminStatusPage() {
  const [snapshot, setSnapshot] = useState<SystemHealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchSystemHealth();
    setSnapshot(data);
    setLoading(false);
  }, []);

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

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            Status do sistema
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saúde da API, banco, Redis e integrações — mesmo check do deploy
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
            healthy
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10",
          )}
        >
          {healthy ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold">
              {healthy ? "Sistema operacional" : "Atenção — algo precisa de revisão"}
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
            {h?.migrationsHint && (
              <p className="text-sm text-amber-400 mt-2">{h.migrationsHint}</p>
            )}
          </div>
        </div>
      )}

      {!snapshot && loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Consultando /api/backend/health…
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
          label="Redis"
          value={boolLabel(h?.redis)}
          hint="Fila WhatsApp / cache"
          icon={Activity}
          tone={statusTone(h?.redis)}
        />
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Table2 className="h-4 w-4 text-emerald-400" />
            Banco e migrations
          </h2>
          <DetailRow
            label="Database"
            value={h?.database ?? "—"}
          />
          <DetailRow
            label="Tabela admin"
            value={boolLabel(h?.adminTable)}
          />
          <DetailRow
            label="Coluna senha (User.passwordHash)"
            value={boolLabel(h?.userPasswordColumn)}
          />
          <DetailRow
            label="Migrations pendentes"
            value={h?.migrationsHint ?? "Nenhuma"}
          />
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
          <DetailRow
            label="Sandbox"
            value={boolLabel(h?.asaas?.sandbox)}
          />
          <DetailRow
            label="Webhook"
            value={h?.asaas?.webhook ?? "—"}
            mono
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-400" />
          Endpoints monitorados
        </h2>
        <DetailRow
          label="Health completo"
          value="/api/backend/health"
          mono
        />
        <DetailRow
          label="Liveness (Railway)"
          value="/api/backend/health/live"
          mono
        />
        <DetailRow
          label="Origem desta página"
          value={
            typeof window !== "undefined"
              ? window.location.origin
              : "—"
          }
          mono
        />
      </section>

      {h && (
        <section className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resposta bruta (JSON)
            </p>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-200/90">
            {JSON.stringify(h, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
