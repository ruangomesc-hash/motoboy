import { prisma } from "@motoboy/db";
import {
  isExpenseEntry,
  resolvePeriodRange,
  splitDeliveryEntries,
  type DeliverySource,
  type PeriodStats,
} from "@motoboy/types";
import { getDayFinancials } from "./day-net.js";

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

const SOURCE_ORDER: DeliverySource[] = [
  "IFOOD",
  "NINETY_NINE",
  "RAPPI",
  "PARTICULAR",
  "OTHER",
];

export async function getPeriodStats(
  userId: string,
  period: "week" | "month",
  anchorDateInput: string,
): Promise<PeriodStats> {
  const range = resolvePeriodRange(period, anchorDateInput);
  const { rangeStart, rangeEnd } = range;

  const [deliveries, shifts] = await Promise.all([
    prisma.delivery.findMany({
      where: {
        userId,
        occurredAt: { gte: rangeStart, lte: rangeEnd },
      },
      orderBy: { occurredAt: "asc" },
    }),
    prisma.shift.findMany({
      where: {
        userId,
        startedAt: { lte: rangeEnd },
        OR: [{ endedAt: null }, { endedAt: { gte: rangeStart } }],
      },
    }),
  ]);

  const byDay = new Map<string, number>();
  const bySource = new Map<
    DeliverySource,
    { gross: number; count: number; km: number }
  >();
  let totalGross = 0;
  let count = 0;
  let totalKm = 0;

  for (const d of deliveries) {
    const gross = toNumber(d.grossValue);
    const key = d.occurredAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + gross);
    if (isExpenseEntry(gross)) continue;

    totalGross += gross;
    count += 1;
    const km = d.distanceKm != null ? toNumber(d.distanceKm) : 0;
    totalKm += km;

    const source = d.source as DeliverySource;
    const row = bySource.get(source) ?? { gross: 0, count: 0, km: 0 };
    row.gross += gross;
    row.count += 1;
    row.km += km;
    bySource.set(source, row);
  }

  const manualExpenseMap = new Map<string, number>();
  const split = splitDeliveryEntries(
    deliveries.map((d) => ({
      id: d.id,
      grossValue: toNumber(d.grossValue),
      originName: d.originName,
    })),
  );
  for (const item of split.manualExpenseItems) {
    manualExpenseMap.set(
      item.label,
      (manualExpenseMap.get(item.label) ?? 0) + item.amount,
    );
  }

  let fuelTotal = 0;
  let maintenanceTotal = 0;
  let otherTotal = 0;
  let totalNet = 0;

  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(rangeEnd);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const day = await getDayFinancials(userId, dayStart, dayEnd);
    totalNet += day.netProfit;
    fuelTotal += day.fuelCost;
    maintenanceTotal += day.maintenanceCost;
    otherTotal += day.otherCost;
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalExpenses = totalGross - totalNet;

  const expenses: PeriodStats["expenses"] = [];
  if (fuelTotal > 0.005) {
    expenses.push({ key: "fuel", label: "Combustível", amount: fuelTotal });
  }
  if (maintenanceTotal > 0.005) {
    expenses.push({
      key: "maintenance",
      label: "Manutenção (km)",
      amount: maintenanceTotal,
    });
  }
  if (otherTotal > 0.005) {
    expenses.push({
      key: "other",
      label: "Alimentação e outros",
      amount: otherTotal,
    });
  }
  for (const [label, amount] of [...manualExpenseMap.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    if (amount > 0.005) {
      expenses.push({ key: `manual:${label}`, label, amount });
    }
  }
  expenses.sort((a, b) => b.amount - a.amount);

  let hoursWorked = 0;
  for (const shift of shifts) {
    hoursWorked += shiftHoursInRange(
      shift.startedAt,
      shift.endedAt,
      rangeStart,
      rangeEnd,
    );
  }

  const grossPerHour =
    hoursWorked > 0 ? totalGross / hoursWorked : null;
  const netPerHour = hoursWorked > 0 ? totalNet / hoursWorked : null;

  const activeShift = shifts.find((s) => s.endedAt == null);

  const bySourceRows = SOURCE_ORDER.filter((s) => bySource.has(s)).map(
    (source) => ({
      source,
      ...bySource.get(source)!,
    }),
  );

  return {
    period,
    anchorDate: range.anchorDate,
    periodStart: range.periodStart,
    periodEnd: range.periodEnd,
    series: Array.from(byDay.entries()).map(([date, gross]) => ({
      date,
      gross,
    })),
    totalGross,
    totalNet,
    totalExpenses,
    count,
    totalKm,
    bySource: bySourceRows,
    expenses,
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
