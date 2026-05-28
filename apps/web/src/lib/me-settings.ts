import type { GoalsPlan, UserProfile } from "@motoboy/types";
import { toStoredWhatsApp } from "@motoboy/types";
import type { ProfileFormState } from "@/components/profile-form";
import { DEFAULT_WORK_DAYS } from "@/lib/work-days";
import type { MeConfigSnapshot } from "@/lib/onboarding";
import type { PendingRegistration } from "@/lib/registration-pending";
import { readPendingRegistration } from "@/lib/registration-pending";

export type MeCostsSnapshot = {
  fuelPricePerLiter: number;
  kmPerLiter: number;
  maintenancePerKm: number;
  dailyFoodCost: number;
  otherDailyCost: number;
};

export type MeSettingsSnapshot = MeConfigSnapshot & {
  costs: MeCostsSnapshot | null;
};

export type MeApiResponse = {
  profile: UserProfile;
  goalsPlan: GoalsPlan | null;
  costs: MeCostsSnapshot | null;
};

export type ConfigFormSnapshot = {
  profile: ProfileFormState;
  monthlyGoal: string;
  costs: {
    fuelPricePerLiter: string;
    kmPerLiter: string;
    maintenancePerKm: string;
    otherDailyCost: string;
  };
};

export type ConfigSavePayload = {
  profile: ProfileFormState;
  monthlyGoal: string;
  costs: ConfigFormSnapshot["costs"];
  saveCosts?: boolean;
};

export function parseMeSettings(data: MeApiResponse): MeSettingsSnapshot {
  return {
    profile: data.profile,
    goalsPlan: data.goalsPlan,
    costs: data.costs,
  };
}

const DEFAULT_COSTS_SNAPSHOT: MeCostsSnapshot = {
  fuelPricePerLiter: 6,
  kmPerLiter: 35,
  maintenancePerKm: 0.15,
  dailyFoodCost: 25,
  otherDailyCost: 0,
};

/** Perfil imediato após cadastro (antes do /me responder). */
export function buildOptimisticMeFromPending(
  pending: PendingRegistration,
): MeSettingsSnapshot {
  return {
    profile: {
      id: "pending",
      name: pending.name,
      email: pending.email,
      city: "",
      vehiclePlate: null,
      whatsappNumber: toStoredWhatsApp(pending.phone),
      workApps: [],
      subscriptionPaymentMethod: "PIX",
      workDays: [...DEFAULT_WORK_DAYS],
    },
    goalsPlan: null,
    costs: { ...DEFAULT_COSTS_SNAPSHOT },
  };
}

export function readPendingRegistrationProfile(): PendingRegistration | null {
  return readPendingRegistration({ requirePassword: false });
}

/** Formulário de Config já preenchido com nome/e-mail do cadastro. */
export function buildInitialConfigForm(): ConfigFormSnapshot {
  const pending = readPendingRegistrationProfile();
  if (pending) {
    return meToConfigForm(buildOptimisticMeFromPending(pending), pending);
  }
  return {
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
      otherDailyCost: "0",
    },
  };
}

export function meToConfigForm(
  me: MeSettingsSnapshot,
  pending?: { name: string; email: string } | null,
): ConfigFormSnapshot {
  const serverName = me.profile.name?.trim() ?? "";
  const serverEmail = me.profile.email?.trim() ?? "";
  const profile: ProfileFormState = {
    name: serverName || pending?.name || "",
    email: serverEmail || pending?.email || "",
    city: me.profile.city ?? "",
    workApps: me.profile.workApps ?? [],
    subscriptionPaymentMethod: me.profile.subscriptionPaymentMethod ?? "PIX",
    workDays:
      me.profile.workDays?.length > 0
        ? me.profile.workDays
        : [...DEFAULT_WORK_DAYS],
  };

  const monthlyGoal = me.goalsPlan
    ? String(Math.round(me.goalsPlan.monthlyTarget))
    : "5000";

  const costs = me.costs
    ? {
        fuelPricePerLiter: String(me.costs.fuelPricePerLiter),
        kmPerLiter: String(me.costs.kmPerLiter),
        maintenancePerKm: String(me.costs.maintenancePerKm),
        otherDailyCost: String(
          Number(me.costs.dailyFoodCost ?? 0) + Number(me.costs.otherDailyCost ?? 0),
        ),
      }
    : {
        fuelPricePerLiter: "6",
        kmPerLiter: "35",
        maintenancePerKm: "0.15",
        otherDailyCost: "0",
      };

  return { profile, monthlyGoal, costs };
}

export function buildConfigSavePayload(
  form: ConfigFormSnapshot,
): ConfigSavePayload {
  return form;
}

export function toProfilePutBody(profile: ProfileFormState) {
  return {
    name: profile.name.trim(),
    email: profile.email.trim(),
    city: profile.city.trim() || null,
    workApps: profile.workApps,
    subscriptionPaymentMethod: profile.subscriptionPaymentMethod,
    workDays: profile.workDays,
  };
}

export function toGoalsPutBody(form: ConfigFormSnapshot) {
  return {
    monthlyTarget: Number(form.monthlyGoal),
    workDays: form.profile.workDays,
  };
}

export function toCostsPutBody(form: ConfigFormSnapshot) {
  return {
    fuelPricePerLiter: Number(form.costs.fuelPricePerLiter),
    kmPerLiter: Number(form.costs.kmPerLiter),
    maintenancePerKm: Number(form.costs.maintenancePerKm),
    dailyFoodCost: 0,
    otherDailyCost: Number(form.costs.otherDailyCost),
  };
}
