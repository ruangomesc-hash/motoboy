"use client";

import type { TodaySummary } from "@motoboy/types";
import { LucroCard } from "@/components/lucro-card";
import {
  CollapsibleSummaryRow,
  CollapsibleSummarySection,
} from "@/components/collapsible-summary-row";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/components/app-data-provider";
import { formatBRL, formatTime } from "@/lib/utils";
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
} from "lucide-react";

const BOT_NUMBER = process.env.NEXT_PUBLIC_EVOLUTION_BOT_NUMBER ?? "5511999999999";

const emptySummary: TodaySummary = {
  grossTotal: 0,
  fuelCost: 0,
  maintenanceCost: 0,
  otherCost: 0,
  totalExpenses: 0,
  netProfit: 0,
  totalKm: 0,
  profitPerKm: 0,
  deliveryCount: 0,
  goalTarget: null,
  goalProgress: null,
  goalRemaining: null,
  goalsPlan: null,
  weeklyGoal: null,
  recentDeliveries: [],
  costsConfigured: false,
  fuel: {
    cost: 0,
    litersToday: 0,
    isActual: false,
    lastPricePerLiter: null,
    avgPricePerLiter: null,
    refuelCountToday: 0,
  },
  odometer: {
    currentKm: null,
    kmToday: 0,
    kmSource: "estimate",
  },
};

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    IFOOD: "iFood",
    NINETY_NINE: "99",
    RAPPI: "Rappi",
    PARTICULAR: "Particular",
    OTHER: "Outro",
  };
  return map[source] ?? source;
}

export default function HomePage() {
  const { today, profileName } = useAppData();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const whatsappUrl = `https://wa.me/${BOT_NUMBER}?text=${encodeURIComponent("entrega 25 reais")}`;

  const s = today ?? emptySummary;
  const kmSourceLabel =
    s.odometer.kmSource === "odometer"
      ? "Hodômetro (painel)"
      : s.odometer.kmSource === "deliveries"
        ? "Soma das entregas"
        : "Estimativa";

  return (
    <AppPage className="p-3 pb-3 space-y-2">
      <header className="space-y-1">
        <MotocopilotoLogo size="sm" centered />
        <h1 className="text-sm font-medium text-muted-foreground text-center">
          {greeting}
          {profileName ? `, ${profileName.split(" ")[0]}` : ""}
        </h1>
      </header>

      <LucroCard value={s.netProfit} />

      {s.costsConfigured === false && s.deliveryCount > 0 && (
        <p className="text-[11px] text-muted-foreground text-center px-2 leading-snug">
          Custos diários ainda não salvos em Config — o lucro usa só o bruto das
          entregas (e gasolina real, se tiver cupom).{" "}
          <Link href="/config" className="text-primary underline-offset-2 hover:underline">
            Configurar custos
          </Link>
        </p>
      )}

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
          <CollapsibleSummaryRow
            Icon={Fuel}
            label="Gasolina"
            value={`−${formatBRL(s.fuelCost)}`}
            valueTone="negative"
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
              ) : s.costsConfigured === false ? (
                <>
                  <p>Sem abastecimento registrado hoje</p>
                  <p>
                    Configure custos em Config para estimar por km, ou mande cupom
                    no Zap
                  </p>
                </>
              ) : (
                <>
                  <p>Estimado por km rodado</p>
                  <p>Manda foto do cupom ou &quot;abasteci X reais Y litros&quot;</p>
                </>
              )
            }
          />

          {s.maintenanceCost > 0 && (
            <CollapsibleSummaryRow
              Icon={Wrench}
              label="Manutenção"
              value={`−${formatBRL(s.maintenanceCost)}`}
              valueTone="negative"
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
            value={`−${formatBRL(s.otherCost)}`}
            valueTone="negative"
            details={
              s.otherCost > 0 ? (
                <>
                  <p>Alimentação, bebidas, lanche, água</p>
                  <p>Estacionamento, pedágio, ferramentas</p>
                  <p>Valor diário em Config</p>
                </>
              ) : s.costsConfigured === false ? (
                <p>
                  Salve seus custos em{" "}
                  <Link href="/config" className="text-primary underline-offset-2 hover:underline">
                    Config
                  </Link>{" "}
                  para incluir alimentação e outros no dia
                </p>
              ) : (
                <p>Sem entregas hoje ou valor zerado em Config</p>
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
          {s.recentDeliveries.length === 0 && (
            <li className="text-[10px] text-muted-foreground px-1">
              Nenhuma entrega hoje. Manda no WhatsApp!
            </li>
          )}
          {s.recentDeliveries.slice(0, 3).map((d) => (
            <li key={d.id}>
              <Link
                href={`/entregas/${d.id}`}
                className="flex justify-between items-center gap-2 py-1.5 border-b border-border/40 text-[10px] min-w-0"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{formatBRL(d.grossValue)}</span>
                  {" · "}
                  {d.originName ?? sourceLabel(d.source)}
                </span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {formatTime(d.occurredAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppPage>
  );
}
