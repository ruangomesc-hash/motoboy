import type { GoalsPlan, UserProfile } from "@motoboy/types";

/** Tour do app — só na primeira vez (localStorage). */
const TOUR_SEEN_KEY = "motocopiloto_app_tour_seen_v1";
const SETUP_GUIDE_HIDDEN_KEY = "motocopiloto_setup_guide_hidden_v1";
const CONFIG_SAVED_ONCE_KEY = "motocopiloto_config_saved_once_v1";

export function isSetupGuideHidden(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SETUP_GUIDE_HIDDEN_KEY) === "1";
}

export function hideSetupGuide(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SETUP_GUIDE_HIDDEN_KEY, "1");
}

export function clearSetupGuideHidden(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SETUP_GUIDE_HIDDEN_KEY);
}

/** Após salvar config uma vez, o app deixa de forçar voltar para /config. */
export function markConfigSavedOnce(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONFIG_SAVED_ONCE_KEY, "1");
}

export function hasConfigSavedOnce(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CONFIG_SAVED_ONCE_KEY) === "1";
}

export function clearConfigSavedOnce(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONFIG_SAVED_ONCE_KEY);
}

export type MeConfigSnapshot = {
  profile: UserProfile;
  goalsPlan: GoalsPlan | null;
  costs: { otherDailyCost: number } | null;
};

/** Config completa = dados salvos no servidor (sem flag local). */
export function getConfigSaveBlockers(input: {
  name: string;
  email: string;
  workApps: unknown[];
  workDays: unknown[];
  monthlyGoal: string;
}): string | null {
  if (!input.name.trim()) return "Informe seu nome.";
  if (!input.email.trim() || !input.email.includes("@")) {
    return "Informe um e-mail válido.";
  }
  if (input.workApps.length === 0) {
    return "Marque pelo menos um app em que você trabalha.";
  }
  if (input.workDays.length === 0) {
    return "Selecione os dias em que você trabalha.";
  }
  const monthly = Number(input.monthlyGoal);
  if (!monthly || monthly <= 0) {
    return "Informe uma meta mensal maior que zero.";
  }
  return null;
}

export function describeIncompleteConfig(me: MeConfigSnapshot): string | null {
  const { profile, goalsPlan, costs } = me;
  if (!profile.name?.trim()) return "nome";
  if (!profile.email?.trim()) return "e-mail";
  if (profile.workApps.length === 0) return "apps de trabalho";
  if (profile.workDays.length === 0) return "dias trabalhados";
  if (!goalsPlan || goalsPlan.monthlyTarget <= 0) return "meta mensal";
  if (!costs) return "custos";
  return null;
}

export function isServerConfigComplete(me: MeConfigSnapshot): boolean {
  const { profile, goalsPlan, costs } = me;
  return Boolean(
    profile.name?.trim() &&
      profile.email?.trim() &&
      profile.workApps.length > 0 &&
      profile.workDays.length > 0 &&
      goalsPlan &&
      goalsPlan.monthlyTarget > 0 &&
      costs,
  );
}

export function isAppTourSeen(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_SEEN_KEY) === "1";
}

export function markAppTourSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_SEEN_KEY, "1");
}

export function resetAppTourSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_SEEN_KEY);
}
