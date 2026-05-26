"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import type { ActivityHistory } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import { ActivityTimeline } from "@/components/activity-timeline";
import { Button } from "@/components/ui/button";

export default function HistoricoPage() {
  const api = useApi();
  const [data, setData] = useState<ActivityHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api<ActivityHistory>(
        `/me/history?page=${page}&limit=30`,
      );
      setData((prev) =>
        page === 1
          ? result
          : prev
            ? {
                ...result,
                items: [...prev.items, ...result.items],
              }
            : result,
      );
    } catch {
      if (page === 1) setData({ items: [], total: 0, page: 1, limit: 30 });
    } finally {
      setLoading(false);
    }
  }, [api, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasMore =
    data != null && data.items.length < data.total && !loading;

  return (
    <div className="p-4 pb-6 space-y-4">
      <header className="flex items-center gap-2">
        <Link
          href="/config"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          aria-label="Voltar para configurações"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" strokeWidth={1.75} />
            Histórico
          </h1>
          <p className="text-xs text-muted-foreground">
            Timeline do que foi alterado no seu perfil e registros
          </p>
        </div>
      </header>

      {loading && page === 1 ? (
        <p className="text-sm text-muted-foreground animate-pulse py-8 text-center">
          Carregando...
        </p>
      ) : (
        <ActivityTimeline items={data?.items ?? []} />
      )}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={() => setPage((p) => p + 1)}
        >
          {loading ? "Carregando..." : "Carregar mais"}
        </Button>
      )}
    </div>
  );
}
