"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOverview } from "@motocheck/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { Button } from "@/components/ui/button";
import { RefreshCw, MapPin } from "lucide-react";

export default function AdminRegioesPage() {
  const api = useAdminApi();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<AdminOverview>("/admin/overview")
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const regions = data?.regions ?? [];
  const maxTotal = Math.max(1, ...regions.map((r) => r.total));

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-400" />
            Regiões
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Onde seus motoboys estão e onde a operação rende mais
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {regions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Peça aos motoboys que preencham a cidade no perfil (Config) para
            mapear as melhores regiões.
          </p>
        ) : (
          regions.map((r) => (
            <div
              key={r.city}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold">{r.city}</h3>
                <span className="text-sm text-muted-foreground">
                  {r.total} cadastros
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
                <div
                  className="h-full bg-emerald-500/70 rounded-full"
                  style={{ width: `${(r.total / maxTotal) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Ativos</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {r.active}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trial</p>
                  <p className="text-lg font-bold text-amber-400">{r.trial}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Atrasados</p>
                  <p className="text-lg font-bold text-red-400">{r.overdue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entregas</p>
                  <p className="text-lg font-bold tabular-nums">
                    {r.deliveries}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Dica: cidades com muitos trials e poucos ativos são oportunidade de
        conversão; cidades com muitas entregas e poucos cadastros podem indicar
        demanda não atendida.
      </p>
    </div>
  );
}
