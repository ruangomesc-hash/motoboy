import { prisma } from "@motoboy/db";
import { splitDeliveryEntries } from "@motoboy/types";
import { getExcludedKeysForDate } from "./daily-cost-exclusion.js";
import { computeDayExpenses } from "./day-expenses.js";
import { getFuelDayStats } from "./fuel.js";
import { getOdometerDayStats } from "./odometer.js";

function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

export type DayFinancials = {
  grossTotal: number;
  manualExpenses: number;
  configExpenses: number;
  netProfit: number;
  fuelCost: number;
  maintenanceCost: number;
  otherCost: number;
  deliveryCount: number;
  totalKm: number;
};

export async function getDayFinancials(
  userId: string,
  dayStart: Date,
  dayEnd: Date,
): Promise<DayFinancials> {
  const [user, deliveries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { costs: true },
    }),
    prisma.delivery.findMany({
      where: { userId, occurredAt: { gte: dayStart, lt: dayEnd } },
    }),
  ]);

  const costs = user?.costs;
  const fuelPrice = toNumber(costs?.fuelPricePerLiter ?? 6);
  const kmPerLiter = toNumber(costs?.kmPerLiter ?? 35);
  const maintenancePerKm = toNumber(costs?.maintenancePerKm ?? 0.15);
  const dailyOther =
    toNumber(costs?.otherDailyCost ?? 0) +
    toNumber(costs?.dailyFoodCost ?? 0);

  const split = splitDeliveryEntries(
    deliveries.map((d) => ({
      id: d.id,
      grossValue: toNumber(d.grossValue),
      distanceKm: d.distanceKm != null ? toNumber(d.distanceKm) : null,
      originName: d.originName,
    })),
  );

  const odometer = await getOdometerDayStats(
    userId,
    dayStart,
    dayEnd,
    split.totalKm,
  );
  const totalKm = odometer.kmToday ?? split.totalKm;

  const estimatedFuelCost =
    totalKm > 0 ? (totalKm / kmPerLiter) * fuelPrice : 0;
  const fuel = await getFuelDayStats(
    userId,
    dayStart,
    dayEnd,
    estimatedFuelCost,
  );

  const dateKey = dayStart.toISOString().slice(0, 10);
  const excludedKeys = await getExcludedKeysForDate(userId, dateKey);

  const hasActivity = deliveries.length > 0;
  const breakdown = computeDayExpenses({
    costsConfigured: Boolean(costs?.costsConfiguredAt),
    fuel,
    totalKm,
    hasActivity,
    dailyOther,
    maintenancePerKm,
    excludedKeys,
  });

  const configExpenses = breakdown.totalExpenses;
  const netProfit =
    split.grossTotal - configExpenses - split.manualExpenses;

  return {
    grossTotal: split.grossTotal,
    manualExpenses: split.manualExpenses,
    configExpenses,
    netProfit,
    fuelCost: breakdown.fuelCost,
    maintenanceCost: breakdown.maintenanceCost,
    otherCost: breakdown.otherCost,
    deliveryCount: split.deliveryCount,
    totalKm,
  };
}

export async function getDayNetProfit(
  userId: string,
  dayStart: Date,
  dayEnd: Date,
): Promise<number> {
  const day = await getDayFinancials(userId, dayStart, dayEnd);
  return day.netProfit;
}

export async function getRangeNetProfit(
  userId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<number> {
  let total = 0;
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  while (cursor <= end) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);
    total += (await getDayFinancials(userId, dayStart, dayEnd)).netProfit;
    cursor.setDate(cursor.getDate() + 1);
  }
  return total;
}
