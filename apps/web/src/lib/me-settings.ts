import type { GoalsPlan, UserProfile } from "@motoboy/types";
import {
  parseBrazilWhatsAppDigits,
  toStoredWhatsApp,
  maskBrazilWhatsAppInput,
} from "@motoboy/types";
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

export function whatsappStoredToLocalInput(
  stored: string | null | undefined,
): string {
  if (!stored?.trim()) return "";
  let digits = stored.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }
  if (digits.length > 11) {
    digits = digits.slice(-11);
  }
  if (digits.length !== 11) return "";
  return maskBrazilWhatsAppInput(digits);
}

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
      whatsappPhone: "",
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
  pending?: { name: string; email: string; phone?: string } | null,
  sessionPhone?: string | null,
): ConfigFormSnapshot {
  const serverName = me.profile.name?.trim() ?? "";
  const serverEmail = me.profile.email?.trim() ?? "";
  const profile: ProfileFormState = {
    name: serverName || pending?.name || "",
    email: serverEmail || pending?.email || "",
    whatsappPhone:
      whatsappStoredToLocalInput(me.profile.whatsappNumber) ||
      (pending?.phone ? maskBrazilWhatsAppInput(pending.phone) : "") ||
      (sessionPhone ? maskBrazilWhatsAppInput(sessionPhone) : ""),
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

/** Identidade estável do formulário para evitar sobrescrever edição local. */
export function configFormFingerprint(form: ConfigFormSnapshot): string {
  const p = form.profile;
  return JSON.stringify({
    name: p.name.trim(),
    email: p.email.trim().toLowerCase(),
    whatsappPhone: p.whatsappPhone.replace(/\D/g, ""),
    city: p.city.trim(),
    workApps: [...p.workApps].sort(),
    workDays: [...p.workDays].sort((a, b) => a - b),
    subscriptionPaymentMethod: p.subscriptionPaymentMethod,
    monthlyGoal: form.monthlyGoal.trim(),
    costs: form.costs,
  });
}

export function meSettingsToConfigFingerprint(
  me: MeSettingsSnapshot,
  sessionPhone?: string | null,
): string {
  return configFormFingerprint(
    meToConfigForm(me, readPendingRegistrationProfile(), sessionPhone),
  );
}

export function toProfilePutBody(
  profile: ProfileFormState,
  loginPhoneLocal?: string | null,
) {
  const body: {
    name: string;
    email: string;
    city: string | null;
    workApps: ProfileFormState["workApps"];
    subscriptionPaymentMethod: ProfileFormState["subscriptionPaymentMethod"];
    workDays: number[];
    whatsapp?: string;
  } = {
    name: profile.name.trim(),
    email: profile.email.trim(),
    city: profile.city.trim() || null,
    workApps: profile.workApps,
    subscriptionPaymentMethod: profile.subscriptionPaymentMethod,
    workDays: profile.workDays,
  };
  let phoneInput = profile.whatsappPhone;
  let localDigits = phoneInput.replace(/\D/g, "");
  if (localDigits.length !== 11 && loginPhoneLocal) {
    phoneInput = loginPhoneLocal;
    localDigits = phoneInput.replace(/\D/g, "");
  }
  if (localDigits.length === 11) {
    body.whatsapp = parseBrazilWhatsAppDigits(phoneInput);
  }
  return body;
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

function costsFromForm(form: ConfigFormSnapshot): MeCostsSnapshot {
  return {
    fuelPricePerLiter: Number(form.costs.fuelPricePerLiter),
    kmPerLiter: Number(form.costs.kmPerLiter),
    maintenancePerKm: Number(form.costs.maintenancePerKm),
    dailyFoodCost: 0,
    otherDailyCost: Number(form.costs.otherDailyCost),
  };
}

/** Monta snapshot local após PUTs (evita GET /me extra no salvar). */
export function buildMeSnapshotAfterSave(
  payload: ConfigSavePayload,
  profile: UserProfile,
  plan: GoalsPlan,
  costsOverride?: MeCostsSnapshot | null,
): MeSettingsSnapshot {
  return {
    profile: {
      ...profile,
      workApps: payload.profile.workApps,
      workDays: payload.profile.workDays,
      subscriptionPaymentMethod: payload.profile.subscriptionPaymentMethod,
    },
    goalsPlan: plan,
    costs: costsOverride ?? costsFromForm(payload),
  };
}
