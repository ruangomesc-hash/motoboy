import { prisma } from "@motoboy/db";
import type { GoalsPlan, WeeklyGoalProgress } from "@motoboy/types";
import {
  countWorkDaysInRange,
  endOfCalendarMonth,
  endOfCalendarWeek,
  formatMonthLabel,
  formatWeekLabel,
  parseWorkDays,
  startOfCalendarMonth,
  startOfCalendarWeek,
  startOfDay,
} from "../lib/work-calendar.js";
import { getRangeNetProfit } from "./day-net.js";

function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

export function buildGoalsPlan(
  monthlyTarget: number,
  workDays: number[],
  referenceDate = new Date(),
): GoalsPlan {
  const monthStart = startOfCalendarMonth(referenceDate);
  const monthEnd = endOfCalendarMonth(referenceDate);
  const weekStart = startOfCalendarWeek(referenceDate);
  const weekEnd = endOfCalendarWeek(weekStart);

  const workDaysInMonth = countWorkDaysInRange(monthStart, monthEnd, workDays);
  const workDaysInWeek = countWorkDaysInRange(weekStart, weekEnd, workDays);

  const dailyTarget =
    workDaysInMonth > 0 ? monthlyTarget / workDaysInMonth : monthlyTarget;
  const weeklyTarget = dailyTarget * workDaysInWeek;

  return {
    monthlyTarget,
    weeklyTarget,
    dailyTarget,
    workDays,
    workDaysInMonth,
    workDaysInWeek,
    monthLabel: formatMonthLabel(referenceDate),
    weekLabel: formatWeekLabel(weekStart),
  };
}

export async function getUserGoalsContext(userId: string) {
  const [user, monthlyGoal] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.goal.findFirst({
      where: { userId, period: "MONTHLY", active: true },
    }),
  ]);

  const workDays = parseWorkDays(user?.workDays);
  const monthlyTarget = monthlyGoal ? toNumber(monthlyGoal.targetValue) : null;

  return { workDays, monthlyTarget };
}

export async function buildWeeklyGoalProgress(
  userId: string,
  monthlyTarget: number,
  workDays: number[],
  referenceDate = new Date(),
): Promise<WeeklyGoalProgress> {
  const plan = buildGoalsPlan(monthlyTarget, workDays, referenceDate);
  const weekStart = startOfCalendarWeek(referenceDate);
  const weekEnd = endOfCalendarWeek(weekStart);
  const tomorrow = startOfDay(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const workDaysElapsed = countWorkDaysInRange(weekStart, tomorrow, workDays);
  const earned = await getRangeNetProfit(userId, weekStart, tomorrow);

  const expectedByToday =
    plan.workDaysInWeek > 0
      ? (plan.weeklyTarget * workDaysElapsed) / plan.workDaysInWeek
      : 0;

  const progress =
    plan.weeklyTarget > 0 ? earned / plan.weeklyTarget : 0;
  const expectedProgress =
    plan.weeklyTarget > 0 ? expectedByToday / plan.weeklyTarget : 0;

  const paceDiff = earned - expectedByToday;
  const paceThreshold = Math.max(plan.dailyTarget * 0.05, 10);

  let pace: WeeklyGoalProgress["pace"] = "on_track";
  if (paceDiff > paceThreshold) pace = "ahead";
  else if (paceDiff < -paceThreshold) pace = "behind";

  return {
    target: plan.weeklyTarget,
    earned,
    expectedByToday,
    progress,
    expectedProgress,
    pace,
    paceAmount: Math.abs(paceDiff),
    workDaysTotal: plan.workDaysInWeek,
    workDaysElapsed,
    weekLabel: plan.weekLabel,
  };
}
