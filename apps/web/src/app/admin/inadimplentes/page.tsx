"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUsersList } from "@motoboy/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ClientsTable } from "@/components/admin/clients-table";

export default function AdminInadimplentesPage() {
  const api = useAdminApi();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsersList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<AdminUsersList>(`/admin/delinquent?page=${page}&limit=25`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Inadimplentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trial vencido, cobrança pendente ou pagamento recusado
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {data && (
        <p className="text-sm rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 px-4 py-3">
          <strong>{data.total}</strong> cliente(s) precisam de atenção para
          converter ou regularizar pagamento.
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <ClientsTable
          items={data?.items ?? []}
          loading={loading}
          showDelinquency
          onUpdated={load}
        />
      </div>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Página {data.page} de {totalPages}
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
