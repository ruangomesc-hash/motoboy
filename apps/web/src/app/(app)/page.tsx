"use client";

import { useMemo, useState } from "react";
import type { DailyCostKey, TodaySummary } from "@motoboy/types";
import { LucroCard } from "@/components/lucro-card";
import {
  CollapsibleSummaryRow,
  CollapsibleSummarySection,
} from "@/components/collapsible-summary-row";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/components/app-data-provider";
import { formatBRL, formatSignedBRL, formatTime } from "@/lib/utils";
import {
  formatDeliveryRecordLabel,
  formatExpenseDisplayLabel,
  isExpenseEntry,
} from "@motoboy/types";
import Link from "next/link";
import { MotocopilotoLogo } from "@/components/brand/logo";
import { AppPage } from "@/components/app-page";
import { WeeklyGoalThermometer } from "@/components/weekly-goal-thermometer";
import {
  TrendingUp,
  Fuel,
  Wrench,
  Wallet,
  Route,
  Gauge,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteDelivery } from "@/hooks/use-delete-delivery";
import { useExcludeDailyCost } from "@/hooks/use-exclude-daily-cost";
import { todayDateInputValue } from "@/lib/local-date";
import { recentDeliveryToPayload } from "@/lib/resolve-delivery-payload";
import { emptyTodaySummary } from "@/lib/empty-today-summary";
import { recomputeTodayFromDeliveries } from "@/lib/today-recent-from-deliveries";

const BOT_NUMBER = process.env.NEXT_PUBLIC_EVOLUTION_BOT_NUMBER ?? "5511999999999";

export default function HomePage() {
  const { today, profileName, todayDeliveries } = useAppData();
  const { deleteDelivery } = useDeleteDelivery();
  const { excludeDailyCost } = useExcludeDailyCost();
  const [deleteTarget, setDeleteTarget] = useState<
    TodaySummary["recentDeliveries"][number] | null
  >(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [costDeleteTarget, setCostDeleteTarget] = useState<{
    key: DailyCostKey;
    label: string;
    amount: number;
  } | null>(null);
  const [costDeleting, setCostDeleting] = useState(false);

  const todayKey = todayDateInputValue();

  const costDeleteButton = (key: DailyCostKey, amount: number) =>
    amount > 0.005 ? (
      <button
        type="button"
        aria-label="Remover custo do dia"
        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive active:opacity-70"
        onClick={() =>
          setCostDeleteTarget({
            key,
            label:
              key === "fuel"
                ? "Gasolina"
                : key === "maintenance"
                  ? "Manutenção"
                  : "Outros (config)",
            amount,
          })
        }
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    ) : null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const whatsappUrl = `https://wa.me/${BOT_NUMBER}?text=${encodeURIComponent("entrega 25 reais")}`;

  const s = useMemo(() => {
    const base = today ?? emptyTodaySummary();
    return recomputeTodayFromDeliveries(todayDeliveries, base);
  }, [today, todayDeliveries]);
  const recentDeliveries = s.recentDeliveries;
  const manualExpensesTotal = s.manualExpensesTotal ?? 0;
  const outrosTotal = s.otherCost + manualExpensesTotal;
  const manualItems = s.manualExpenseItems ?? [];
  const kmSourceLabel =
    s.odometer.kmSource === "odometer"
      ? "Hodômetro (painel)"
      : s.odometer.kmSource === "deliveries"
        ? "Soma das entregas"
        : "Estimativa";

  return (
    <AppPage className="p-3 pb-4 space-y-2">
      <header className="space-y-1">
        <MotocopilotoLogo size="sm" centered />
        <h1 className="text-sm font-medium text-muted-foreground text-center">
          {greeting}
          {profileName ? `, ${profileName.split(" ")[0]}` : ""}
        </h1>
      </header>

      <LucroCard value={s.netProfit} />

      {(s.weeklyGoal || s.goalTarget != null) && (
        <WeeklyGoalThermometer
          weekly={s.weeklyGoal}
          daily={
            s.goalTarget != null && s.goalRemaining != null
              ? {
                  target: s.goalTarget,
                  remaining: s.goalRemaining,
                  progress: s.goalProgress ?? 0,
                }
              : null
          }
        />
      )}

      <section>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
          Resumo do dia
        </p>
        <div className="rounded-xl border border-border bg-card/80 px-2 w-full max-w-full min-w-0 overflow-hidden">
          <CollapsibleSummaryRow
            Icon={TrendingUp}
            label="Entrou"
            value={formatBRL(s.grossTotal)}
            valueTone="positive"
            details={
              <>
                <p>{s.deliveryCount} entrega(s) registrada(s) hoje</p>
                <p>Valor bruto antes dos custos</p>
              </>
            }
          />

          <CollapsibleSummarySection
            title="Saídas"
            summary={`−${formatBRL(s.totalExpenses)}`}
            summaryTone="negative"
          >
          {(s.fuelCost > 0.005 || s.fuel.isActual) && (
          <CollapsibleSummaryRow
            Icon={Fuel}
            label="Gasolina"
            value={`−${formatBRL(s.fuelCost)}`}
            valueTone="negative"
            trailingAction={costDeleteButton("fuel", s.fuelCost)}
            details={
              s.fuel.isActual ? (
                <>
                  <p>
                    {s.fuel.litersToday.toFixed(1)} L abastecidos ·{" "}
                    {s.fuel.refuelCountToday} vez(es)
                  </p>
                  <p>
                    Último:{" "}
                    {s.fuel.lastPricePerLiter != null
                      ? `${formatBRL(s.fuel.lastPricePerLiter)}/L`
                      : "—"}
                  </p>
                  <p>
                    Média:{" "}
                    {s.fuel.avgPricePerLiter != null
                      ? `${formatBRL(s.fuel.avgPricePerLiter)}/L`
                      : "—"}
                  </p>
                  <p className="text-emerald-400/80">
                    Valor real (cupom ou Zap)
                  </p>
                </>
              ) : (
                <>
                  <p>Sem abastecimento registrado hoje</p>
                  <p>
                    Manda foto do cupom ou &quot;abasteci X reais Y litros&quot; no
                    WhatsApp
                  </p>
                </>
              )
            }
          />
          )}

          {s.maintenanceCost > 0 && (
            <CollapsibleSummaryRow
              Icon={Wrench}
              label="Manutenção"
              value={`−${formatBRL(s.maintenanceCost)}`}
              valueTone="negative"
              trailingAction={costDeleteButton(
                "maintenance",
                s.maintenanceCost,
              )}
              details={
                <>
                  <p>
                    {s.totalKm.toFixed(0)} km × valor/km da config
                  </p>
                  <p>Calculado com base no km rodado hoje</p>
                </>
              }
            />
          )}

          <CollapsibleSummaryRow
            Icon={Wallet}
            label="Outros custos"
            value={`−${formatBRL(outrosTotal)}`}
            valueTone="negative"
            trailingAction={costDeleteButton("other", s.otherCost)}
            details={
              manualItems.length > 0 || s.otherCost > 0 ? (
                <>
                  {manualItems.map((item) => (
                    <p key={item.id ?? `${item.label}-${item.amount}`}>
                      {item.label}: −{formatBRL(item.amount)}
                    </p>
                  ))}
                </>
              ) : (
                <p>
                  Registre despesas com valor negativo na lista de entregas
                  (lanche, estacionamento, etc.)
                </p>
              )
            }
          />

          </CollapsibleSummarySection>

          <CollapsibleSummarySection
            title="Logística"
            summary={`${s.totalKm.toFixed(0)} km · ${formatBRL(s.profitPerKm)}/km`}
          >
          <CollapsibleSummaryRow
            Icon={Route}
            label="Rodado"
            value={`${s.totalKm.toFixed(0)} km`}
            details={
              <>
                <p>Fonte: {kmSourceLabel}</p>
                {s.odometer.currentKm != null && (
                  <p>
                    Painel: {s.odometer.currentKm.toLocaleString("pt-BR")} km
                  </p>
                )}
                <p>Manda foto do hodômetro no Zap para atualizar</p>
              </>
            }
          />

          <CollapsibleSummaryRow
            Icon={Gauge}
            label="Por km"
            value={formatBRL(s.profitPerKm)}
            details={
              <>
                <p>Lucro líquido ÷ km rodado</p>
                <p>
                  {formatBRL(s.netProfit)} ÷ {s.totalKm.toFixed(0)} km
                </p>
              </>
            }
          />
          </CollapsibleSummarySection>
        </div>
      </section>

      <Button asChild size="default" className="w-full h-10 text-sm gap-2">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          Abrir WhatsApp p/ registrar
        </a>
      </Button>

      <section>
        <h2 className="text-[10px] font-medium text-muted-foreground mb-1 px-1">
          Últimas entregas
        </h2>
        <ul className="space-y-0">
          {recentDeliveries.length === 0 && (
            <li className="text-[10px] text-muted-foreground px-1">
              Nenhuma entrega hoje. Manda no WhatsApp!
            </li>
          )}
          {recentDeliveries.map((d) => {
            const expense = isExpenseEntry(d.grossValue);
            return (
            <li key={d.id} className="flex items-center gap-0.5 border-b border-border/40">
              <Link
                href={`/entregas/${d.id}`}
                className="flex flex-1 justify-between items-center gap-2 py-1.5 text-[10px] min-w-0"
              >
                <span className="min-w-0 truncate">
                  <span
                    className={`font-medium ${expense ? "text-red-400" : ""}`}
                  >
                    {formatSignedBRL(d.grossValue)}
                  </span>
                  {" · "}
                  {expense
                    ? formatExpenseDisplayLabel(d.originName)
                    : formatDeliveryRecordLabel(d.source, d.originName)}
                </span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {formatTime(d.occurredAt)}
                </span>
              </Link>
              <button
                type="button"
                aria-label={
                  expense ? "Apagar despesa" : "Apagar entrega"
                }
                className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive active:opacity-70"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteTarget(d);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </li>
          );
          })}
        </ul>
      </section>

      <ConfirmDialog
        open={costDeleteTarget != null}
        title="Remover custo do dia?"
        description="O valor automático (Config) deixa de entrar no lucro de hoje e nas estatísticas. Você pode registrar de novo depois pelo Zap ou Config."
        confirmLabel="Remover"
        loading={costDeleting}
        onCancel={() => setCostDeleteTarget(null)}
        onConfirm={() => {
          if (!costDeleteTarget || costDeleting) return;
          const { key, amount } = costDeleteTarget;
          setCostDeleteTarget(null);
          setCostDeleting(true);
          void excludeDailyCost(key, amount, todayKey).finally(() =>
            setCostDeleting(false),
          );
        }}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title={
          deleteTarget && isExpenseEntry(deleteTarget.grossValue)
            ? "Apagar despesa?"
            : "Apagar entrega?"
        }
        description={
          deleteTarget && isExpenseEntry(deleteTarget.grossValue)
            ? "A despesa será removida da Home, Entregas e Estatísticas."
            : "A entrega será removida da Home, Entregas e Estatísticas."
        }
        confirmLabel="Apagar"
        error={deleteError}
        loading={deleting}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          if (!deleteTarget || deleting) return;
          const snapshot = recentDeliveryToPayload(deleteTarget);
          const id = deleteTarget.id;
          setDeleteTarget(null);
          setDeleteError(null);
          setDeleting(true);
          void deleteDelivery(id, snapshot).finally(() => setDeleting(false));
        }}
      />
    </AppPage>
  );
}
