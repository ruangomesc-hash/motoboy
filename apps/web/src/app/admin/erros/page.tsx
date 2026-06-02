"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminClientErrorLogs } from "@motoboy/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bug, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ERROR_CODES = [
  "ALL",
  "JWT_EXPIRED",
  "JWT_INVALID",
  "NOT_AUTHENTICATED",
  "USER_NOT_FOUND",
  "ACCOUNT_CANCELED",
  "SUBSCRIPTION_REQUIRED",
  "SERVER_UNAVAILABLE",
  "NETWORK_ERROR",
  "DATABASE_ERROR",
  "DELIVERY_SAVE_FAILED",
  "INTERNAL_ERROR",
  "UNKNOWN",
] as const;

function severityClass(severity: AdminClientErrorLogs["items"][number]["adminSeverity"]) {
  if (severity === "critical") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (severity === "warning") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-blue-500/15 text-blue-400 border-blue-500/30";
}

export default function AdminErrorsPage() {
  const api = useAdminApi();
  const [code, setCode] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminClientErrorLogs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({
      page: String(page),
      limit: "40",
      ...(code !== "ALL" ? { code } : {}),
    });
    api<AdminClientErrorLogs>(`/admin/client-errors?${q}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api, page, code]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6 text-red-400" />
            Histórico de erros
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Falhas do app com tradução para suporte — visível só no admin
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ERROR_CODES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCode(c);
              setPage(1);
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] border transition-colors",
              code === c
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-border text-muted-foreground hover:bg-white/5",
            )}
          >
            {c === "ALL" ? "Todos" : c.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="rounded-xl border border-white/10 divide-y divide-white/5">
        {!data?.items.length ? (
          <p className="p-6 text-center text-muted-foreground text-sm">
            {loading ? "Carregando..." : "Nenhum erro registrado"}
          </p>
        ) : (
          data.items.map((row) => (
            <article key={row.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-sm">{row.adminTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.userName ?? "Sem nome"}
                    {row.userPhone ? ` · ${row.userPhone}` : ""}
                    {row.userCity ? ` · ${row.userCity}` : ""}
                    {!row.userId && " · usuário não identificado"}
                  </p>
                </div>
                <time className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                  {new Date(row.createdAt).toLocaleString("pt-BR")}
                </time>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">
                {row.adminDetail}
              </p>

              <p className="text-xs text-emerald-400/90">
                <span className="text-muted-foreground">O que fazer: </span>
                {row.adminAction}
              </p>

              <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full border",
                    severityClass(row.adminSeverity),
                  )}
                >
                  {row.adminSeverity === "critical"
                    ? "Crítico"
                    : row.adminSeverity === "warning"
                      ? "Atenção"
                      : "Info"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground font-mono">
                  {row.errorCode}
                </span>
                {row.httpStatus != null && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                    HTTP {row.httpStatus}
                  </span>
                )}
                {row.route && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground font-mono truncate max-w-[200px]">
                    {row.method ? `${row.method} ` : ""}
                    {row.route}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                  {row.source === "api" ? "API" : row.source === "whatsapp" ? "WhatsApp" : "App"}
                </span>
              </div>

              <details className="text-[10px] text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Mensagem técnica original
                </summary>
                <pre className="mt-1 p-2 rounded bg-black/30 overflow-x-auto font-mono whitespace-pre-wrap">
                  {row.rawMessage}
                </pre>
              </details>
            </article>
          ))
        )}
      </div>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
