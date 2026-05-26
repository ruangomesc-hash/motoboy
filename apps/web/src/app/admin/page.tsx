"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOverview } from "@motoboy/types";
import { useAdminApi } from "@/hooks/use-admin-api";
import { StatCard } from "@/components/admin/stat-card";
import { formatBRL } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  RefreshCw,
  DollarSign,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDayLabel(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export default function AdminDashboardPage() {
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

  const maxSignup = Math.max(
    1,
    ...(data?.signups.last7Days.map((p) => p.count) ?? [1]),
  );

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operação em tempo real — assinaturas, trials e regiões
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

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { href: "/admin/clientes", label: "Lista de clientes", icon: Users },
          {
            href: "/admin/inadimplentes",
            label: "Inadimplentes",
            icon: AlertTriangle,
          },
          { href: "/admin/logs", label: "Logs de uso", icon: ScrollText },
          { href: "/admin/regioes", label: "Melhores regiões", icon: TrendingUp },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:bg-white/[0.06] transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <Icon className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
              {label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </section>

      {data && (
        <>
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Funcionários (motoboys)
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <StatCard
                label="Total cadastrados"
                value={data.users.total}
                icon={Users}
              />
              <StatCard
                label="Ativos (pagos)"
                value={data.users.active}
                hint="Assinatura em dia"
                icon={UserCheck}
                tone="success"
              />
              <StatCard
                label="Em trial"
                value={data.users.trial}
                hint="Teste gratuito"
                icon={Clock}
                tone="warning"
              />
              <StatCard
                label="Trial vencido"
                value={data.users.overdue}
                hint="Precisam assinar"
                icon={AlertTriangle}
                tone="danger"
              />
              <StatCard
                label="Pausados"
                value={data.users.paused}
                icon={Users}
              />
              <StatCard
                label="Cobrança pendente"
                value={data.users.pendingPayment}
                icon={DollarSign}
                tone="warning"
              />
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Novos cadastros
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                  <p className="text-xl font-bold">{data.signups.today}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">7 dias</p>
                  <p className="text-xl font-bold">{data.signups.week}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mês</p>
                  <p className="text-xl font-bold">{data.signups.month}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Últimos 7 dias
              </p>
              <div className="flex items-end gap-1.5 h-24">
                {data.signups.last7Days.map((p) => (
                  <div
                    key={p.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-emerald-500/80 rounded-t min-h-[4px] transition-all"
                      style={{
                        height: `${Math.max(8, (p.count / maxSignup) * 72)}px`,
                      }}
                      title={`${p.count} cadastros`}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {formatDayLabel(p.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                MRR, churn e assinantes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">MRR</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatBRL(data.revenue.mrr)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Novos assinantes (mês)
                  </p>
                  <p className="text-xl font-bold">
                    {data.growth.newSubscribersMonth}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Churn (mês)</p>
                  <p className="text-xl font-bold text-red-400">
                    {data.growth.churnedMonth}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {data.growth.churnRatePercent}% taxa
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inadimplentes</p>
                  <p className="text-xl font-bold text-amber-400">
                    {data.growth.delinquentTotal}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-muted-foreground">Recebido no mês</p>
                <p className="text-lg font-bold">
                  {formatBRL(data.revenue.paidThisMonth)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {data.revenue.paidCountThisMonth} pagamentos ·{" "}
                  {data.growth.newSubscribersWeek} novos assinantes na semana
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Operação hoje
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Entregas hoje"
                value={data.operations.deliveriesToday}
                icon={Package}
              />
              <StatCard
                label="Entregas total"
                value={data.operations.deliveriesTotal}
                icon={Package}
              />
              <StatCard
                label="Turnos abertos"
                value={data.operations.activeShifts}
                icon={Users}
              />
              <StatCard
                label="Entregas / ativo"
                value={data.operations.avgDeliveriesPerActiveUser}
                hint="Média hoje"
                icon={TrendingUp}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Top regiões (por cadastros)
            </h2>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="p-3 font-medium">Cidade</th>
                    <th className="p-3 font-medium text-right">Total</th>
                    <th className="p-3 font-medium text-right">Ativos</th>
                    <th className="p-3 font-medium text-right">Trial</th>
                    <th className="p-3 font-medium text-right">Atrasados</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-muted-foreground">
                        Nenhuma cidade informada nos perfis ainda.
                      </td>
                    </tr>
                  ) : (
                    data.regions.slice(0, 8).map((r) => (
                      <tr
                        key={r.city}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="p-3 font-medium">{r.city}</td>
                        <td className="p-3 text-right tabular-nums">{r.total}</td>
                        <td className="p-3 text-right tabular-nums text-emerald-400">
                          {r.active}
                        </td>
                        <td className="p-3 text-right tabular-nums text-amber-400">
                          {r.trial}
                        </td>
                        <td className="p-3 text-right tabular-nums text-red-400">
                          {r.overdue}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-[10px] text-muted-foreground text-right">
            Atualizado:{" "}
            {new Date(data.generatedAt).toLocaleString("pt-BR")}
          </p>
        </>
      )}
    </div>
  );
}
