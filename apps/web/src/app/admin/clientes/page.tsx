"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUserRow, AdminUsersList } from "@motoboy/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientsTable } from "@/components/admin/clients-table";
import { AddClientDialog } from "@/components/admin/add-client-dialog";

const STATUS_FILTERS = [
  { id: "ALL", label: "Todos" },
  { id: "ACTIVE", label: "Pagos" },
  { id: "TRIAL", label: "Trial" },
  { id: "PAUSED", label: "Pausados" },
  { id: "CANCELED", label: "Cancelados" },
] as const;

export default function AdminClientesPage() {
  const api = useAdminApi();
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsersList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({
      page: String(page),
      limit: "25",
      ...(status !== "ALL" ? { status } : {}),
    });
    api<AdminUsersList>(`/admin/users?${q}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api, page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Lista de clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos os motoboys cadastrados — trial, pagos e cancelados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddClientDialog
            onCreated={load}
            onSubmit={(body) =>
              api<AdminUserRow>("/admin/users", {
                method: "POST",
                body: JSON.stringify(body),
              })
            }
          />
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setStatus(f.id);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              status === f.id
                ? "bg-primary/15 border-primary text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <ClientsTable
          items={data?.items ?? []}
          loading={loading}
          onUpdated={load}
        />
      </div>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {data.total} clientes — página {data.page} de {totalPages}
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
