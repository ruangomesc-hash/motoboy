"use client";

import { Fragment, useState } from "react";
import type {
  AdminAffiliateReferrals,
  AdminAffiliateRow,
} from "@motocheck/types";
import { cn } from "@/lib/utils";
import { buildSignupLink } from "@/lib/affiliate-ref";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp, Link2 } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  TRIAL: "Trial",
  PAUSED: "Pausado",
  CANCELED: "Cancelado",
};

export function AffiliatesRankingTable({
  items,
  loading,
  loadReferrals,
}: {
  items: AdminAffiliateRow[];
  loading?: boolean;
  loadReferrals: (affiliateId: string) => Promise<AdminAffiliateReferrals>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<AdminAffiliateReferrals | null>(
    null,
  );
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function toggleExpand(row: AdminAffiliateRow) {
    if (expandedId === row.id) {
      setExpandedId(null);
      setReferrals(null);
      return;
    }
    setExpandedId(row.id);
    setReferralsLoading(true);
    try {
      const data = await loadReferrals(row.id);
      setReferrals(data);
    } catch {
      setReferrals(null);
    } finally {
      setReferralsLoading(false);
    }
  }

  async function copyLink(code: string, id: string) {
    const link = buildSignupLink(window.location.origin, code);
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!items.length) {
    return (
      <p className="p-6 text-center text-muted-foreground text-sm">
        {loading ? "Carregando..." : "Nenhum afiliado cadastrado"}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-white/10 text-left text-muted-foreground">
            <th className="p-3 font-medium w-12">#</th>
            <th className="p-3 font-medium">Afiliado</th>
            <th className="p-3 font-medium">Cupom</th>
            <th className="p-3 font-medium text-right">Indicações</th>
            <th className="p-3 font-medium text-right">Este mês</th>
            <th className="p-3 font-medium text-right">Ativos</th>
            <th className="p-3 font-medium text-right">Conversão</th>
            <th className="p-3 font-medium">Link</th>
            <th className="p-3 font-medium w-10" />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const expanded = expandedId === row.id;
            const medal =
              row.rank === 1
                ? "text-amber-400"
                : row.rank === 2
                  ? "text-slate-300"
                  : row.rank === 3
                    ? "text-amber-700"
                    : "text-muted-foreground";

            return (
              <Fragment key={row.id}>
                <tr
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className={cn("p-3 font-bold tabular-nums", medal)}>
                    {row.rank}
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{row.name}</p>
                    {!row.active && (
                      <span className="text-[10px] text-red-400">Inativo</span>
                    )}
                  </td>
                  <td className="p-3">
                    <code className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {row.code}
                    </code>
                  </td>
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {row.totalReferrals}
                  </td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">
                    {row.referralsThisMonth}
                  </td>
                  <td className="p-3 text-right tabular-nums text-emerald-400">
                    {row.paidReferrals}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {row.conversionRatePercent}%
                  </td>
                  <td className="p-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => copyLink(row.code, row.id)}
                    >
                      {copiedId === row.id ? (
                        "Copiado!"
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(row)}
                      className="text-muted-foreground hover:text-foreground p-1"
                      aria-label={expanded ? "Recolher" : "Ver indicações"}
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
                {expanded && (
                  <tr className="bg-white/[0.02]">
                    <td colSpan={9} className="p-4">
                      {referralsLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Carregando indicações...
                        </p>
                      ) : referrals && referrals.items.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            {referrals.total} motoboy(s) via cupom{" "}
                            {referrals.affiliate.code}
                          </p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {referrals.items.map((r) => (
                              <li
                                key={r.id}
                                className="rounded-lg border border-white/10 px-3 py-2 text-xs"
                              >
                                <p className="font-medium">
                                  {r.name ?? "Sem nome"}
                                </p>
                                <p className="text-muted-foreground">
                                  {r.city ?? "—"} ·{" "}
                                  {STATUS_LABEL[r.status] ?? r.status} ·{" "}
                                  {new Date(r.createdAt).toLocaleDateString(
                                    "pt-BR",
                                  )}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma indicação ainda para este afiliado.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
