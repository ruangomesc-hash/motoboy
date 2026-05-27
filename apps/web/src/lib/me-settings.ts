import type { GoalsPlan, UserProfile } from "@motoboy/types";
import type { ProfileFormState } from "@/components/profile-form";
import { DEFAULT_WORK_DAYS } from "@/lib/work-days";
import type { MeConfigSnapshot } from "@/lib/onboarding";

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
};

export function parseMeSettings(data: MeApiResponse): MeSettingsSnapshot {
  return {
    profile: data.profile,
    goalsPlan: data.goalsPlan,
    costs: data.costs,
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
          Number(me.costs.dailyFoodCost ?? 0) +
            Number(me.costs.otherDailyCost ?? 0) || 33,
        ),
      }
    : {
        fuelPricePerLiter: "6",
        kmPerLiter: "35",
        maintenancePerKm: "0.15",
        otherDailyCost: "33",
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
