"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminAffiliateReferrals,
  AdminAffiliateRow,
  AdminAffiliatesList,
  AdminCreateAffiliateInput,
} from "@motocheck/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { AddAffiliateDialog } from "@/components/admin/add-affiliate-dialog";
import { AffiliatesRankingTable } from "@/components/admin/affiliates-ranking-table";
import { Trophy } from "lucide-react";

export default function AdminAfiliadosPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminAffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<AdminAffiliatesList>("/admin/affiliates");
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalReferrals = items.reduce((s, a) => s + a.totalReferrals, 0);
  const totalActive = items.reduce((s, a) => s + a.paidReferrals, 0);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-400" strokeWidth={1.75} />
            Afiliados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ranking por indicações. Cada cupom gera link único no cadastro.
          </p>
        </div>
        <AddAffiliateDialog
          onCreated={load}
          onSubmit={(body: AdminCreateAffiliateInput) =>
            api<AdminAffiliateRow>("/admin/affiliates", {
              method: "POST",
              body: JSON.stringify(body),
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
            Afiliados
          </p>
          <p className="text-2xl font-bold mt-1">{items.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
            Indicações totais
          </p>
          <p className="text-2xl font-bold mt-1">{totalReferrals}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
            Convertidos (ativos)
          </p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {totalActive}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
            Taxa média
          </p>
          <p className="text-2xl font-bold mt-1">
            {totalReferrals > 0
              ? `${Math.round((totalActive / totalReferrals) * 1000) / 10}%`
              : "—"}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <AffiliatesRankingTable
          items={items}
          loading={loading}
          loadReferrals={(affiliateId) =>
            api<AdminAffiliateReferrals>(
              `/admin/affiliates/${affiliateId}/referrals`,
            )
          }
        />
      </div>
    </div>
  );
}
