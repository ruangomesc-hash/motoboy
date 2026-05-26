import { prisma } from "@motoboy/db";
import type { FuelDayStats } from "@motoboy/types";

function toNumber(d: { toString(): string } | number): number {
  return typeof d === "number" ? d : Number(d);
}

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function registerFuelRefuel(
  userId: string,
  data: {
    totalAmount: number;
    liters: number;
    receiptPhotoUrl?: string | null;
    rawInput: unknown;
  },
) {
  const pricePerLiter = data.totalAmount / data.liters;

  const refuel = await prisma.fuelRefuel.create({
    data: {
      userId,
      totalAmount: data.totalAmount,
      liters: data.liters,
      pricePerLiter,
      receiptPhotoUrl: data.receiptPhotoUrl,
      rawInput: data.rawInput as object,
    },
  });

  await prisma.costConfig.upsert({
    where: { userId },
    create: {
      userId,
      fuelPricePerLiter: pricePerLiter,
    },
    update: {
      fuelPricePerLiter: pricePerLiter,
    },
  });

  return refuel;
}

export async function getFuelDayStats(
  userId: string,
  dayStart: Date,
  dayEnd: Date,
  estimatedFuelCost: number,
): Promise<FuelDayStats> {
  const [todayRefuels, lastRefuel, avgWindow] = await Promise.all([
    prisma.fuelRefuel.findMany({
      where: { userId, occurredAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.fuelRefuel.findFirst({
      where: { userId },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.fuelRefuel.findMany({
      where: {
        userId,
        occurredAt: {
          gte: new Date(dayStart.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { occurredAt: "desc" },
      take: 20,
    }),
  ]);

  const litersToday = todayRefuels.reduce(
    (s, r) => s + toNumber(r.liters),
    0,
  );
  const actualCost = todayRefuels.reduce(
    (s, r) => s + toNumber(r.totalAmount),
    0,
  );

  const lastPricePerLiter = lastRefuel
    ? toNumber(lastRefuel.pricePerLiter)
    : null;

  const avgPricePerLiter =
    avgWindow.length > 0
      ? avgWindow.reduce((s, r) => s + toNumber(r.pricePerLiter), 0) /
        avgWindow.length
      : null;

  return {
    cost: todayRefuels.length > 0 ? actualCost : estimatedFuelCost,
    litersToday,
    isActual: todayRefuels.length > 0,
    lastPricePerLiter,
    avgPricePerLiter,
    refuelCountToday: todayRefuels.length,
  };
}

export function formatFuelConfirmation(
  totalAmount: number,
  liters: number,
  pricePerLiter: number,
  stats: FuelDayStats,
): string {
  return (
    `⛽ Abastecimento registrado!\n` +
    `${totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${liters.toFixed(2)} L · ${pricePerLiter.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/L\n` +
    `Hoje no posto: ${stats.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${stats.refuelCountToday}x)\n` +
    `Último: ${stats.lastPricePerLiter?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}/L · Média: ${stats.avgPricePerLiter?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}/L`
  );
}
