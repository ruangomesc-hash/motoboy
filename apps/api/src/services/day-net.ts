import { prisma } from "@motocheck/db";
import { getFuelDayStats } from "./fuel.js";
import { getOdometerDayStats } from "./odometer.js";

function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

export async function getDayNetProfit(
  userId: string,
  dayStart: Date,
  dayEnd: Date,
): Promise<number> {
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

  const grossTotal = deliveries.reduce(
    (sum, d) => sum + toNumber(d.grossValue),
    0,
  );
  const deliveryKmSum = deliveries.reduce(
    (sum, d) => sum + toNumber(d.distanceKm),
    0,
  );

  const odometer = await getOdometerDayStats(
    userId,
    dayStart,
    dayEnd,
    deliveryKmSum,
  );
  const totalKm = odometer.kmToday ?? deliveryKmSum;

  const estimatedFuelCost =
    totalKm > 0 ? (totalKm / kmPerLiter) * fuelPrice : 0;
  const fuel = await getFuelDayStats(
    userId,
    dayStart,
    dayEnd,
    estimatedFuelCost,
  );

  const fuelCost = fuel.cost;
  const hasActivity = deliveries.length > 0;
  const maintenanceCost =
    hasActivity && totalKm > 0 ? totalKm * maintenancePerKm : 0;
  const otherCost = hasActivity ? dailyOther : 0;

  return grossTotal - fuelCost - maintenanceCost - otherCost;
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
  while (cursor < end) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);
    total += await getDayNetProfit(userId, dayStart, dayEnd);
    cursor.setDate(cursor.getDate() + 1);
  }
  return total;
}
