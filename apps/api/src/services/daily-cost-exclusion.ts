import { prisma } from "@motoboy/db";
import {
  dailyCostKeySchema,
  type DailyCostKey,
  isDailyCostKey,
} from "@motoboy/types";

export async function listDailyCostExclusions(
  userId: string,
  fromDateKey: string,
  toDateKey: string,
): Promise<{ dateKey: string; costKey: DailyCostKey }[]> {
  const rows = await prisma.dailyCostExclusion.findMany({
    where: {
      userId,
      dateKey: { gte: fromDateKey, lte: toDateKey },
    },
    select: { dateKey: true, costKey: true },
  });
  return rows.flatMap((r) => {
    const parsed = dailyCostKeySchema.safeParse(r.costKey);
    if (!parsed.success) return [];
    return [{ dateKey: r.dateKey, costKey: parsed.data }];
  });
}

export async function getExcludedKeysForDate(
  userId: string,
  dateKey: string,
): Promise<Set<DailyCostKey>> {
  const rows = await prisma.dailyCostExclusion.findMany({
    where: { userId, dateKey },
    select: { costKey: true },
  });
  const keys = new Set<DailyCostKey>();
  for (const r of rows) {
    if (isDailyCostKey(r.costKey)) keys.add(r.costKey);
  }
  return keys;
}

export async function excludeDailyCost(
  userId: string,
  dateKey: string,
  costKey: DailyCostKey,
): Promise<void> {
  await prisma.dailyCostExclusion.upsert({
    where: {
      userId_dateKey_costKey: { userId, dateKey, costKey },
    },
    create: { userId, dateKey, costKey },
    update: {},
  });
}

export async function restoreDailyCost(
  userId: string,
  dateKey: string,
  costKey: DailyCostKey,
): Promise<void> {
  await prisma.dailyCostExclusion.deleteMany({
    where: { userId, dateKey, costKey },
  });
}
