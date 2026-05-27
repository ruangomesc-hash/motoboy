import type { GoalsPlan, UserProfile } from "@motoboy/types";

/** Tour do app — só na primeira vez (localStorage). */
const TOUR_SEEN_KEY = "motocopiloto_app_tour_seen_v1";

export type MeConfigSnapshot = {
  profile: UserProfile;
  goalsPlan: GoalsPlan | null;
  costs: { otherDailyCost: number } | null;
};

/** Config completa = dados salvos no servidor (sem flag local). */
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
