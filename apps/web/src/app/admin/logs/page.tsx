"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUsageLogs } from "@motocheck/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { Button } from "@/components/ui/button";
import { ScrollText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOG_CATEGORY_LABEL } from "@/lib/admin-labels";

const CATEGORIES = [
  "ALL",
  "DELIVERY",
  "PROFILE",
  "GOAL",
  "COSTS",
  "FUEL",
  "ODOMETER",
  "SHIFT",
] as const;

export default function AdminLogsPage() {
  const api = useAdminApi();
  const [category, setCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsageLogs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({
      page: String(page),
      limit: "40",
      ...(category !== "ALL" ? { category } : {}),
    });
    api<AdminUsageLogs>(`/admin/logs?${q}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api, page, category]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-emerald-400" />
            Logs de uso
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            O que os clientes fizeram no app e via WhatsApp
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              category === c
                ? "bg-primary/15 border-primary text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {LOG_CATEGORY_LABEL[c] ?? c}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-white/10 divide-y divide-white/5">
        {!data?.items.length ? (
          <p className="p-6 text-center text-muted-foreground text-sm">
            {loading ? "Carregando..." : "Nenhum log registrado ainda"}
          </p>
        ) : (
          data.items.map((log) => (
            <article key={log.id} className="p-4 space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{log.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.userName ?? "Sem nome"} · {log.userPhone}
                    {log.userCity ? ` · ${log.userCity}` : ""}
                  </p>
                </div>
                <time className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </time>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                  {LOG_CATEGORY_LABEL[log.category] ?? log.category}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full",
                    log.source === "whatsapp"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-blue-500/10 text-blue-400",
                  )}
                >
                  {log.source === "whatsapp" ? "WhatsApp" : "App"}
                </span>
              </div>
              {log.changesSummary && (
                <p className="text-xs text-muted-foreground">
                  {log.changesSummary}
                </p>
              )}
            </article>
          ))
        )}
      </div>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {data.total} eventos — página {data.page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
