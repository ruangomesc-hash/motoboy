import { prisma } from "@motoboy/db";
import { TRIAL_DAYS, capTrialEndsAt } from "@motoboy/types";

/** Ajusta trialEndsAt no banco quando ainda reflete política antiga (ex.: 14 dias). */
export async function ensureTrialEndsAtPolicy(user: {
  id: string;
  status: string;
  createdAt: Date;
  trialEndsAt: Date | null;
}): Promise<Date | null> {
  if (user.status !== "TRIAL" || !user.trialEndsAt) return user.trialEndsAt;

  const capped = capTrialEndsAt(user.trialEndsAt, user.createdAt, TRIAL_DAYS);
  if (capped.getTime() !== user.trialEndsAt.getTime()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { trialEndsAt: capped },
    });
  }
  return capped;
}
