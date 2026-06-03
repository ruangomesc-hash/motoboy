import { prisma } from "@motoboy/db";
import { splitDeliveryEntries, type TodaySummary } from "@motoboy/types";
import { getFuelDayStats } from "./fuel.js";
import { getOdometerDayStats } from "./odometer.js";
import {
  buildGoalsPlan,
  buildWeeklyGoalProgress,
  getUserGoalsContext,
} from "./goals-plan.js";
import { getExcludedKeysForDate } from "./daily-cost-exclusion.js";
import { computeDayExpenses } from "./day-expenses.js";
import { dayRangeFromDateInput } from "../lib/local-day-range.js";

function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

/** Hoje no calendário BRT (YYYY-MM-DD). */
export function todayDateInputBrt(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export async function getTodaySummary(userId: string): Promise<TodaySummary> {
  const { start, end } = dayRangeFromDateInput(todayDateInputBrt());
  const now = new Date();

  const [deliveries, legacyDailyGoal, goalsContext] = await Promise.all([
    prisma.delivery.findMany({
      where: { userId, occurredAt: { gte: start, lt: end } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.goal.findFirst({
      where: { userId, period: "DAILY", active: true },
    }),
    getUserGoalsContext(userId),
  ]);

  const split = splitDeliveryEntries(
    deliveries.map((d) => ({
      id: d.id,
      grossValue: toNumber(d.grossValue),
      distanceKm: d.distanceKm != null ? toNumber(d.distanceKm) : null,
      originName: d.originName,
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

  const fuel = await getFuelDayStats(userId, start, end);

  const dateKey = todayDateInputBrt(now);
  const excludedKeys = await getExcludedKeysForDate(userId, dateKey);

  const expenses = computeDayExpenses({ fuel, excludedKeys });
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
    manualExpensesTotal: split.manualExpenses,
    manualExpenseItems: split.manualExpenseItems,
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
