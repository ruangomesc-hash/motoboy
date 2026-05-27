import { prisma } from "@motoboy/db";
import type { PeriodStats } from "@motoboy/types";
import { getRangeNetProfit } from "./day-net.js";

function toNumber(d: { toString(): string } | number): number {
  return typeof d === "number" ? d : Number(d);
}

function shiftHoursInRange(
  startedAt: Date,
  endedAt: Date | null,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const end = endedAt ?? new Date();
  const effectiveStart =
    startedAt > rangeStart ? startedAt : rangeStart;
  const effectiveEnd = end < rangeEnd ? end : rangeEnd;
  if (effectiveEnd <= effectiveStart) return 0;
  return (
    (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60)
  );
}

export async function getPeriodStats(
  userId: string,
  period: "week" | "month",
): Promise<PeriodStats> {
  const now = new Date();
  const start = new Date(now);
  if (period === "week") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setMonth(start.getMonth() - 1);
  }

  const [deliveries, shifts, totalNet] = await Promise.all([
    prisma.delivery.findMany({
      where: { userId, occurredAt: { gte: start } },
      orderBy: { occurredAt: "asc" },
    }),
    prisma.shift.findMany({
      where: {
        userId,
        startedAt: { lte: now },
        OR: [{ endedAt: null }, { endedAt: { gte: start } }],
      },
    }),
    getRangeNetProfit(userId, start, now),
  ]);

  const byDay = new Map<string, number>();
  for (const d of deliveries) {
    const key = d.occurredAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + toNumber(d.grossValue));
  }

  const totalGross = deliveries.reduce(
    (s, d) => s + toNumber(d.grossValue),
    0,
  );
  const totalKm = deliveries.reduce(
    (s, d) => s + (d.distanceKm != null ? toNumber(d.distanceKm) : 0),
    0,
  );

  let hoursWorked = 0;
  for (const shift of shifts) {
    hoursWorked += shiftHoursInRange(
      shift.startedAt,
      shift.endedAt,
      start,
      now,
    );
  }

  const grossPerHour =
    hoursWorked > 0 ? totalGross / hoursWorked : null;
  const netPerHour = hoursWorked > 0 ? totalNet / hoursWorked : null;

  const activeShift = shifts.find((s) => s.endedAt == null);

  return {
    period,
    series: Array.from(byDay.entries()).map(([date, gross]) => ({
      date,
      gross,
    })),
    totalGross,
    totalNet,
    count: deliveries.length,
    totalKm,
    hoursWorked,
    grossPerHour,
    netPerHour,
    activeShift: activeShift
      ? {
          id: activeShift.id,
          startedAt: activeShift.startedAt.toISOString(),
        }
      : null,
  };
}
