import { prisma } from "@motoboy/db";
import type { OdometerDayStats } from "@motoboy/types";

function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function registerOdometerReading(
  userId: string,
  data: {
    odometerKm: number;
    photoUrl?: string | null;
    rawInput: unknown;
  },
) {
  const reading = await prisma.odometerReading.create({
    data: {
      userId,
      odometerKm: data.odometerKm,
      photoUrl: data.photoUrl,
      rawInput: data.rawInput as object,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { currentOdometerKm: data.odometerKm },
  });

  const activeShift = await prisma.shift.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (activeShift && activeShift.startKm == null) {
    await prisma.shift.update({
      where: { id: activeShift.id },
      data: { startKm: data.odometerKm },
    });
  }

  return reading;
}

export async function getOdometerDayStats(
  userId: string,
  dayStart: Date,
  dayEnd: Date,
  deliveryKmSum: number,
): Promise<OdometerDayStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const todayReadings = await prisma.odometerReading.findMany({
    where: { userId, recordedAt: { gte: dayStart, lt: dayEnd } },
    orderBy: { recordedAt: "asc" },
  });

  const currentKm = user?.currentOdometerKm
    ? toNumber(user.currentOdometerKm)
    : todayReadings.length > 0
      ? toNumber(todayReadings[todayReadings.length - 1]!.odometerKm)
      : null;

  let kmToday: number | null = null;
  let kmSource: OdometerDayStats["kmSource"] = "estimate";

  if (todayReadings.length >= 2) {
    const first = toNumber(todayReadings[0]!.odometerKm);
    const last = toNumber(todayReadings[todayReadings.length - 1]!.odometerKm);
    const delta = last - first;
    if (delta > 0) {
      kmToday = delta;
      kmSource = "odometer";
    }
  } else if (todayReadings.length === 1) {
    const shift = await prisma.shift.findFirst({
      where: {
        userId,
        startedAt: { gte: dayStart, lt: dayEnd },
        startKm: { not: null },
      },
      orderBy: { startedAt: "asc" },
    });
    if (shift?.startKm) {
      const delta =
        toNumber(todayReadings[0]!.odometerKm) - toNumber(shift.startKm);
      if (delta > 0) {
        kmToday = delta;
        kmSource = "odometer";
      }
    }
  }

  if (kmToday == null && deliveryKmSum > 0) {
    kmToday = deliveryKmSum;
    kmSource = "deliveries";
  }

  return {
    currentKm,
    kmToday: kmToday ?? deliveryKmSum,
    kmSource,
  };
}

export function formatOdometerConfirmation(
  odometerKm: number,
  stats: OdometerDayStats,
): string {
  const kmToday =
    stats.kmToday != null ? `${stats.kmToday.toFixed(1)} km rodados hoje` : "";
  return (
    `🏍️ Hodômetro: ${odometerKm.toLocaleString("pt-BR")} km\n` +
    (kmToday ? `${kmToday} (pelo painel)\n` : "") +
    `Use isso pra acompanhar rotas e consumo.`
  );
}
