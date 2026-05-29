import { prisma } from "@motoboy/db";
import { splitDeliveryEntries, type TodaySummary } from "@motoboy/types";
import { getFuelDayStats } from "./fuel.js";
import { getOdometerDayStats } from "./odometer.js";
import {
  buildGoalsPlan,
  buildWeeklyGoalProgress,
  getUserGoalsContext,
} from "./goals-plan.js";
import { computeDayExpenses } from "./day-expenses.js";

function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getTodaySummary(userId: string): Promise<TodaySummary> {
  const start = startOfDay();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const now = new Date();

  const [user, deliveries, legacyDailyGoal, goalsContext] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { costs: true },
    }),
    prisma.delivery.findMany({
      where: { userId, occurredAt: { gte: start, lt: end } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.goal.findFirst({
      where: { userId, period: "DAILY", active: true },
    }),
    getUserGoalsContext(userId),
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
      grossValue: toNumber(d.grossValue),
      distanceKm: d.distanceKm,
    })),
  );
  const grossTotal = split.grossTotal;
  const deliveryKmSum = split.totalKm;

  const odometer = await getOdometerDayStats(
    userId,
    start,
    end,
    deliveryKmSum,
  );
  const totalKm = odometer.kmToday ?? deliveryKmSum;

  const estimatedFuelCost =
    totalKm > 0 ? (totalKm / kmPerLiter) * fuelPrice : 0;
  const fuel = await getFuelDayStats(
    userId,
    start,
    end,
    estimatedFuelCost,
  );

  const hasActivity = deliveries.length > 0;
  const expenses = computeDayExpenses({
    costsConfigured: Boolean(costs?.costsConfiguredAt),
    fuel,
    totalKm,
    hasActivity,
    dailyOther,
    maintenancePerKm,
  });
  const { fuelCost, maintenanceCost, otherCost, totalExpenses: configExpenses } =
    expenses;
  const totalExpenses = configExpenses + split.manualExpenses;
  const netProfit = grossTotal - totalExpenses;
  const profitPerKm = totalKm > 0 ? netProfit / totalKm : 0;

  let goalsPlan = null;
  let weeklyGoal = null;
  let goalTarget: number | null = null;
  let goalProgress: number | null = null;
  let goalRemaining: number | null = null;

  if (goalsContext.monthlyTarget != null && goalsContext.monthlyTarget > 0) {
    goalsPlan = buildGoalsPlan(
      goalsContext.monthlyTarget,
      goalsContext.workDays,
      now,
    );
    weeklyGoal = await buildWeeklyGoalProgress(
      userId,
      goalsContext.monthlyTarget,
      goalsContext.workDays,
      now,
    );
    goalTarget = goalsPlan.dailyTarget;
    goalProgress =
      goalTarget > 0 ? Math.min(netProfit / goalTarget, 1.5) : null;
    goalRemaining =
      goalTarget != null ? Math.max(goalTarget - netProfit, 0) : null;
  } else if (legacyDailyGoal) {
    goalTarget = toNumber(legacyDailyGoal.targetValue);
    goalProgress =
      goalTarget > 0 ? Math.min(netProfit / goalTarget, 1) : null;
    goalRemaining =
      goalTarget != null ? Math.max(goalTarget - netProfit, 0) : null;
  }

  return {
    grossTotal,
    fuelCost,
    maintenanceCost,
    otherCost,
    totalExpenses,
    netProfit,
    costsConfigured: expenses.costsConfigured,
    totalKm,
    profitPerKm,
    deliveryCount: split.deliveryCount,
    fuel,
    odometer,
    goalTarget,
    goalProgress,
    goalRemaining,
    goalsPlan,
    weeklyGoal,
    recentDeliveries: deliveries.slice(0, 3).map((d) => ({
      id: d.id,
      grossValue: toNumber(d.grossValue),
      originName: d.originName,
      source: d.source,
      occurredAt: d.occurredAt.toISOString(),
    })),
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
