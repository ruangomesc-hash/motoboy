import type { SubscriptionStatus } from "@motoboy/types";

/** Dias restantes até o fim do trial (0 = último dia). */
export function trialDaysRemaining(
  trialEndsAt: string | Date | null | undefined,
  now = new Date(),
): number | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

export function formatTrialEndsLabel(days: number): string {
  if (days <= 0) return "Seu trial acaba hoje";
  if (days === 1) return "Falta 1 dia de trial grátis";
  return `Faltam ${days} dias de trial grátis`;
}

export function isTrialActive(sub: SubscriptionStatus | null): boolean {
  if (!sub || sub.status !== "TRIAL" || !sub.trialEndsAt) return false;
  return trialDaysRemaining(sub.trialEndsAt) !== null && new Date(sub.trialEndsAt) > new Date();
}
