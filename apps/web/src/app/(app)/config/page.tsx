"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import {
  isAppTourSeen,
  isServerConfigComplete,
  type MeConfigSnapshot,
} from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";
import type { FuelDayStats, GoalsPlan, UserProfile } from "@motoboy/types";
import { Check, Fuel, Gauge, History, Target } from "lucide-react";
import Link from "next/link";
import {
  ProfileForm,
  type ProfileFormState,
} from "@/components/profile-form";
import { DEFAULT_WORK_DAYS } from "@/lib/work-days";
import { AppPage } from "@/components/app-page";

interface Costs {
  fuelPricePerLiter: string | number;
  kmPerLiter: string | number;
  maintenancePerKm: string | number;
  dailyFoodCost?: string | number;
  otherDailyCost: string | number;
}

interface MeResponse {
  costs: Costs | null;
  goalsPlan: GoalsPlan | null;
  profile: UserProfile;
}

const emptyProfile: ProfileFormState = {
  name: "",
  email: "",
  city: "",
  workApps: [],
  subscriptionPaymentMethod: "PIX",
  workDays: [...DEFAULT_WORK_DAYS],
};

function ConfigPageInner() {
  const api = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "1";
  const [profile, setProfile] = useState<ProfileFormState>(emptyProfile);
  const [monthlyGoal, setMonthlyGoal] = useState("5000");
  const [costs, setCosts] = useState({
    fuelPricePerLiter: "6",
    kmPerLiter: "35",
    maintenancePerKm: "0.15",
    otherDailyCost: "33",
  });
  const [saved, setSaved] = useState(false);
  const [fuelStats, setFuelStats] = useState<FuelDayStats | null>(null);
  const [currentKm, setCurrentKm] = useState<number | null>(null);

  const previewPlan = useMemo(() => {
    const monthly = Number(monthlyGoal);
    if (!monthly || monthly <= 0) return null;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const set = new Set(profile.workDays);
    let workDaysInMonth = 0;
    let workDaysInWeek = 0;
    const cursor = new Date(monthStart);
    while (cursor < monthEnd) {
      if (set.has(cursor.getDay())) workDaysInMonth++;
      cursor.setDate(cursor.getDate() + 1);
    }
    const w = new Date(weekStart);
    while (w < weekEnd) {
      if (set.has(w.getDay())) workDaysInWeek++;
      w.setDate(w.getDate() + 1);
    }
    const dailyTarget = workDaysInMonth > 0 ? monthly / workDaysInMonth : monthly;
    const weeklyTarget = dailyTarget * workDaysInWeek;
    return { dailyTarget, weeklyTarget, workDaysInMonth, workDaysInWeek };
  }, [monthlyGoal, profile.workDays]);

  useEffect(() => {
    api<{ stats: FuelDayStats }>("/me/fuel").then((r) => setFuelStats(r.stats));
    api<{ currentKm: number | null }>("/me/odometer").then((r) =>
      setCurrentKm(r.currentKm),
    );
  }, [api]);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    setLoadError(null);
    api<MeResponse>("/me")
      .then((user) => {
        if (user.profile) {
          setProfile({
            name: user.profile.name ?? "",
            email: user.profile.email ?? "",
            city: user.profile.city ?? "",
            workApps: user.profile.workApps,
            subscriptionPaymentMethod:
              user.profile.subscriptionPaymentMethod ?? "PIX",
            workDays:
              user.profile.workDays?.length > 0
                ? user.profile.workDays
                : [...DEFAULT_WORK_DAYS],
          });
        }
        if (user.goalsPlan) {
          setMonthlyGoal(String(Math.round(user.goalsPlan.monthlyTarget)));
        }
        if (user.costs) {
          const combined =
            Number(user.costs.dailyFoodCost ?? 0) +
            Number(user.costs.otherDailyCost ?? 0);
          setCosts({
            fuelPricePerLiter: String(user.costs.fuelPricePerLiter),
            kmPerLiter: String(user.costs.kmPerLiter),
            maintenancePerKm: String(user.costs.maintenancePerKm),
            otherDailyCost: String(combined || 33),
          });
        }
      })
      .catch((e: Error) => setLoadError(e.message));

    api<MeConfigSnapshot>("/me")
      .then((me) => setConfigReady(isServerConfigComplete(me)))
      .catch(() => setConfigReady(false));
  }, [api]);

  async function save() {
    await api("/me/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: profile.name.trim() || undefined,
        email: profile.email.trim() || undefined,
        city: profile.city.trim() || null,
        workApps: profile.workApps,
        subscriptionPaymentMethod: profile.subscriptionPaymentMethod,
        workDays: profile.workDays,
      }),
    });
    await api("/me/goals/plan", {
      method: "PUT",
      body: JSON.stringify({
        monthlyTarget: Number(monthlyGoal),
        workDays: profile.workDays,
      }),
    });
    await api("/me/costs", {
      method: "PUT",
      body: JSON.stringify({
        fuelPricePerLiter: Number(costs.fuelPricePerLiter),
        kmPerLiter: Number(costs.kmPerLiter),
        maintenancePerKm: Number(costs.maintenancePerKm),
        dailyFoodCost: 0,
        otherDailyCost: Number(costs.otherDailyCost),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    const me = await api<MeConfigSnapshot>("/me");
    const ready = isServerConfigComplete(me);
    setConfigReady(ready);
    if (ready) {
      if (!isAppTourSeen()) {
        router.push("/?tour=1");
      } else {
        router.push("/");
      }
    }
  }

  return (
    <AppPage className="p-4 space-y-6 pb-8">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold">Configurações</h1>
        <Link
          href="/historico"
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 shrink-0 pt-1"
        >
          <History className="h-3.5 w-3.5" strokeWidth={2} />
          Histórico
        </Link>
      </div>

      {loadError && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {loadError}
        </p>
      )}

      {isSetup && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm space-y-1">
          <p className="font-medium text-emerald-300">Configure antes de usar o app</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Siga os passos explicativos abaixo e toque em{" "}
            <strong className="text-foreground">Salvar configurações</strong> no final.
            Depois mostramos como funciona cada aba.
          </p>
        </div>
      )}

      <div id="onboarding-profile" className="scroll-mt-4 rounded-xl transition-shadow">
        <ProfileForm value={profile} onChange={setProfile} />
      </div>

      <section
        id="onboarding-goals"
        className="scroll-mt-4 space-y-3 rounded-xl border border-border bg-card p-4 transition-shadow"
      >
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4" strokeWidth={1.75} />
          Metas (calendário real)
        </h2>
        <Field
          label="Meta mensal (R$)"
          value={monthlyGoal}
          onChange={setMonthlyGoal}
        />
        {previewPlan && (
          <div className="text-xs text-muted-foreground space-y-1 rounded-lg bg-muted/30 p-3">
            <p>
              <span className="text-foreground font-medium">Semana:</span>{" "}
              {formatBRL(previewPlan.weeklyTarget)} ({previewPlan.workDaysInWeek}{" "}
              dias úteis nesta semana)
            </p>
            <p>
              <span className="text-foreground font-medium">Dia:</span>{" "}
              {formatBRL(previewPlan.dailyTarget)} ({previewPlan.workDaysInMonth}{" "}
              dias úteis no mês)
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          A meta semanal e a do dia são calculadas automaticamente pelos dias
          trabalhados no mês e na semana correntes.
        </p>
      </section>

      <section className="p-4 rounded-xl border border-border bg-card space-y-2">
        <h2 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
          <Fuel className="h-4 w-4" strokeWidth={1.75} />
          Gasolina do dia
        </h2>
        {fuelStats?.isActual ? (
          <>
            <p className="text-sm">
              Gasto hoje: <strong>{formatBRL(fuelStats.cost)}</strong> (
              {fuelStats.litersToday.toFixed(1)} L)
            </p>
            <p className="text-xs text-muted-foreground">
              Último preço:{" "}
              {fuelStats.lastPricePerLiter != null
                ? `${formatBRL(fuelStats.lastPricePerLiter)}/L`
                : "—"}
              {" · "}
              Média:{" "}
              {fuelStats.avgPricePerLiter != null
                ? `${formatBRL(fuelStats.avgPricePerLiter)}/L`
                : "—"}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Manda no WhatsApp: foto do cupom ou &quot;abasteci 40 reais 6 litros&quot;
            para usar valor real no lucro.
          </p>
        )}
        {currentKm != null && (
          <p className="text-sm pt-2 border-t border-border">
            <span className="flex items-center gap-2">
              <Gauge className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              Hodômetro: <strong>{currentKm.toLocaleString("pt-BR")} km</strong>
            </span>
          </p>
        )}
      </section>

      <section
        id="onboarding-costs"
        className="scroll-mt-4 space-y-3 rounded-xl transition-shadow"
      >
        <h2 className="text-sm font-medium text-muted-foreground">
          Custos (fallback se não abastecer no Zap)
        </h2>
        <Field
          label="Gasolina estimada (R$/L)"
          value={costs.fuelPricePerLiter}
          onChange={(v) => setCosts((c) => ({ ...c, fuelPricePerLiter: v }))}
        />
        <Field
          label="Km por litro"
          value={costs.kmPerLiter}
          onChange={(v) => setCosts((c) => ({ ...c, kmPerLiter: v }))}
        />
        <Field
          label="Manutenção (R$/km)"
          value={costs.maintenancePerKm}
          onChange={(v) => setCosts((c) => ({ ...c, maintenancePerKm: v }))}
        />
        <Field
          label="Outros custos (R$/dia)"
          value={costs.otherDailyCost}
          onChange={(v) => setCosts((c) => ({ ...c, otherDailyCost: v }))}
        />
        <p className="text-xs text-muted-foreground -mt-1">
          Inclui alimentação, bebidas, estacionamento, pedágio etc.
        </p>
      </section>

      <Button id="onboarding-save" onClick={save} className="w-full scroll-mt-4" size="lg">
        {saved ? (
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4" strokeWidth={2} />
            Salvo
          </span>
        ) : (
          "Salvar configurações"
        )}
      </Button>

      <button
        type="button"
        className="w-full text-center text-xs text-muted-foreground hover:text-primary"
        onClick={() => router.push("/config?guide=1")}
      >
        Ver explicação das configurações novamente
      </button>
      {configReady && !isAppTourSeen() && (
        <button
          type="button"
          className="w-full text-center text-xs text-muted-foreground hover:text-primary"
          onClick={() => router.push("/?tour=1")}
        >
          Ver apresentação do app
        </button>
      )}
    </AppPage>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
}

export default function ConfigPage() {
  return (
    <Suspense
      fallback={
        <AppPage className="p-4 text-sm text-muted-foreground animate-pulse">
          Carregando configurações...
        </AppPage>
      }
    >
      <ConfigPageInner />
    </Suspense>
  );
}
