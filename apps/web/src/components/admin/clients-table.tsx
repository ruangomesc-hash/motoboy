"use client";

import type { AdminUserRow } from "@motocheck/types";
import { cn } from "@/lib/utils";
import { DELINQUENCY_LABEL, formatAppUsage } from "@/lib/admin-labels";
import { ClientPaymentActions } from "@/components/admin/client-payment-actions";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  TRIAL: "Trial",
  PAUSED: "Pausado",
  CANCELED: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-500/10",
  TRIAL: "text-amber-400 bg-amber-500/10",
  PAUSED: "text-muted-foreground bg-white/5",
  CANCELED: "text-red-400 bg-red-500/10",
};

export function ClientsTable({
  items,
  loading,
  showDelinquency = false,
  onUpdated,
}: {
  items: AdminUserRow[];
  loading?: boolean;
  showDelinquency?: boolean;
  onUpdated?: () => void;
}) {
  if (!items.length) {
    return (
      <p className="p-6 text-center text-muted-foreground text-sm">
        {loading ? "Carregando..." : "Nenhum registro"}
      </p>
    );
  }

  return (
    <table className="w-full text-sm min-w-[980px]">
      <thead>
        <tr className="border-b border-white/10 text-left text-muted-foreground">
          <th className="p-3 font-medium">Cliente</th>
          <th className="p-3 font-medium">Tempo no app</th>
          <th className="p-3 font-medium">WhatsApp</th>
          <th className="p-3 font-medium">Cidade</th>
          <th className="p-3 font-medium">Indicação</th>
          <th className="p-3 font-medium">Status</th>
          {showDelinquency && (
            <th className="p-3 font-medium">Inadimplência</th>
          )}
          <th className="p-3 font-medium text-right">Entregas</th>
          {onUpdated && <th className="p-3 font-medium">Ações</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((row) => (
          <tr
            key={row.id}
            className="border-b border-white/5 last:border-0"
          >
            <td className="p-3">
              <p className="font-medium">{row.name ?? "—"}</p>
              {row.subscribedAt && (
                <p className="text-[10px] text-muted-foreground">
                  Assinante desde{" "}
                  {new Date(row.subscribedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </td>
            <td className="p-3">
              <p className="text-sm font-medium">
                {formatAppUsage(
                  row.usageMonths,
                  row.usageRemainderDays,
                  row.usageDays,
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">
                desde{" "}
                {new Date(row.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </td>
            <td className="p-3 text-muted-foreground font-mono text-xs">
              {row.whatsappNumber}
            </td>
            <td className="p-3">{row.city ?? "—"}</td>
            <td className="p-3">
              {row.affiliateName ? (
                <div>
                  <p className="text-sm">{row.affiliateName}</p>
                  {row.affiliateCode && (
                    <code className="text-[10px] text-emerald-400/90">
                      {row.affiliateCode}
                    </code>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
            <td className="p-3">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  STATUS_CLASS[row.status],
                )}
              >
                {STATUS_LABEL[row.status] ?? row.status}
              </span>
            </td>
            {showDelinquency && (
              <td className="p-3">
                {row.delinquencyReason ? (
                  <div>
                    <p className="text-xs text-red-400 font-medium">
                      {DELINQUENCY_LABEL[row.delinquencyReason] ??
                        row.delinquencyReason}
                    </p>
                    {row.daysOverdue != null && row.daysOverdue > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {row.daysOverdue} dia(s) em atraso
                      </p>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </td>
            )}
            <td className="p-3 text-right tabular-nums">{row.deliveryCount}</td>
            {onUpdated && (
              <td className="p-3 align-top">
                <ClientPaymentActions client={row} onUpdated={onUpdated} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
