import type { GoalsPlan, UserProfile } from "@motoboy/types";

const CONFIG_KEY = "motocopiloto_config_onboarding_v1";
const TOUR_KEY = "motocopiloto_app_tour_v1";

export type MeConfigSnapshot = {
  profile: UserProfile;
  goalsPlan: GoalsPlan | null;
  costs: { otherDailyCost: number } | null;
};

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

export function isConfigOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CONFIG_KEY) === "1";
}

export function markConfigOnboardingDone(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFIG_KEY, "1");
}

export function isAppTourDone(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_KEY) === "1";
}

export function markAppTourDone(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_KEY, "1");
}

export function resetOnboardingForDev(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(TOUR_KEY);
}
