"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import {
  clearSetupGuideHidden,
  describeIncompleteConfig,
  getConfigSaveBlockers,
  isAppTourSeen,
} from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";
import type { FuelDayStats } from "@motoboy/types";
import { Check, Fuel, Gauge, History, Target } from "lucide-react";
import Link from "next/link";
import {
  ProfileForm,
  type ProfileFormState,
} from "@/components/profile-form";
import { DEFAULT_WORK_DAYS } from "@/lib/work-days";
import {
  clearPendingRegistration,
  readPendingRegistration,
} from "@/lib/registration-pending";
import { meToConfigForm, type ConfigFormSnapshot } from "@/lib/me-settings";
import { AppPage } from "@/components/app-page";

const defaultForm: ConfigFormSnapshot = {
  profile: {
    name: "",
    email: "",
    city: "",
    workApps: [],
    subscriptionPaymentMethod: "PIX",
    workDays: [...DEFAULT_WORK_DAYS],
  },
  monthlyGoal: "5000",
  costs: {
    fuelPricePerLiter: "6",
    kmPerLiter: "35",
    maintenancePerKm: "0.15",
    otherDailyCost: "33",
  },
};

function ConfigPageInner() {
  const api = useApi();
  const pathname = usePathname();
  const {
    saveMeSettings,
    loadMeSettings,
    meSettings,
    meSettingsLoading,
    configComplete,
  } = useAppData();
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "1";

  const [form, setForm] = useState<ConfigFormSnapshot>(defaultForm);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fuelStats, setFuelStats] = useState<FuelDayStats | null>(null);
  const [currentKm, setCurrentKm] = useState<number | null>(null);
  const { profile, monthlyGoal, costs } = form;

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
    if (sessionStatus !== "authenticated") return;
    if (!pathname.startsWith("/config")) return;
    setLoadError(null);
    void loadMeSettings({ force: true }).catch((e: Error) => {
      setLoadError(e.message);
    });
  }, [pathname, sessionStatus, loadMeSettings]);

  useEffect(() => {
    if (!meSettings || saving) return;
    const pending = readPendingRegistration();
    const next = meToConfigForm(meSettings, pending);
    setForm(next);
    if (next.profile.name?.trim() && next.profile.email?.trim()) {
      clearPendingRegistration();
    }
  }, [meSettings, saving]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    api<{ stats: FuelDayStats }>("/me/fuel").then((r) => setFuelStats(r.stats));
    api<{ currentKm: number | null }>("/me/odometer").then((r) =>
      setCurrentKm(r.currentKm),
    );
  }, [api, sessionStatus]);

  function patchForm(patch: Partial<ConfigFormSnapshot>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function setProfile(next: ProfileFormState) {
    setForm((prev) => ({ ...prev, profile: next }));
  }

  async function save() {
    const blocker = getConfigSaveBlockers({
      name: profile.name,
      email: profile.email,
      workApps: profile.workApps,
      workDays: profile.workDays,
      monthlyGoal,
    });
    if (blocker) {
      setSaveError(blocker);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const { complete, me } = await saveMeSettings(form);
      clearPendingRegistration();
      clearSetupGuideHidden();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (!complete) {
        const missing = me ? describeIncompleteConfig(me) : null;
        setSaveError(
          missing
            ? `Não foi possível concluir. Falta: ${missing}.`
            : "Salvo parcialmente. Confira os campos e tente de novo.",
        );
        return;
      }

      if (isSetup) {
        if (!isAppTourSeen()) router.replace("/?tour=1");
        else router.replace("/");
      }
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  const showLoading = meSettingsLoading && !meSettings;

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

      {showLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Carregando suas configurações...
        </p>
      )}

      {loadError && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {loadError}
        </p>
      )}
      {saveError && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {saveError}
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
          onChange={(v) => patchForm({ monthlyGoal: v })}
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
          onChange={(v) =>
            patchForm({ costs: { ...costs, fuelPricePerLiter: v } })
          }
        />
        <Field
          label="Km por litro"
          value={costs.kmPerLiter}
          onChange={(v) => patchForm({ costs: { ...costs, kmPerLiter: v } })}
        />
        <Field
          label="Manutenção (R$/km)"
          value={costs.maintenancePerKm}
          onChange={(v) =>
            patchForm({ costs: { ...costs, maintenancePerKm: v } })
          }
        />
        <Field
          label="Outros custos (R$/dia)"
          value={costs.otherDailyCost}
          onChange={(v) =>
            patchForm({ costs: { ...costs, otherDailyCost: v } })
          }
        />
        <p className="text-xs text-muted-foreground -mt-1">
          Inclui alimentação, bebidas, estacionamento, pedágio etc.
        </p>
      </section>

      <Button
        id="onboarding-save"
        onClick={save}
        className="w-full scroll-mt-4"
        size="lg"
        disabled={saving}
      >
        {saving ? (
          "Salvando..."
        ) : saved ? (
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
      {configComplete && !isAppTourSeen() && (
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
