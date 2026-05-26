import { prisma, type DeliverySource } from "@motoboy/db";
import type {
  DeliveryCreateInput,
  ExtractionResult,
} from "@motoboy/types";
import { getTodaySummary, formatCurrency } from "./today.js";

export async function createDeliveryManual(
  userId: string,
  input: DeliveryCreateInput,
) {
  return prisma.delivery.create({
    data: {
      userId,
      source: input.source as DeliverySource,
      grossValue: input.grossValue,
      originName: input.originName ?? null,
      destinationAddr: input.destinationAddr ?? null,
      distanceKm: input.distanceKm ?? null,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      rawInput: { channel: "app_manual", payload: input },
    },
  });
}

export async function createDeliveryFromExtraction(
  userId: string,
  data: Extract<ExtractionResult, { type: "delivery" }>,
  rawInput: unknown,
) {
  return prisma.delivery.create({
    data: {
      userId,
      source: data.source as DeliverySource,
      grossValue: data.grossValue,
      originName: data.originName,
      destinationAddr: data.destinationAddr,
      distanceKm: data.distanceKm,
      rawInput: rawInput as object,
    },
  });
}

export async function buildDeliveryConfirmation(userId: string): Promise<string> {
  const summary = await getTodaySummary(userId);
  const last = summary.recentDeliveries[0];
  if (!last) {
    return `✅ Entrega registrada.\nLucro de hoje: ${formatCurrency(summary.netProfit)}`;
  }
  const name = last.originName ?? last.source;
  return `✅ ${formatCurrency(last.grossValue)} da ${name} registrado.\nLucro de hoje: ${formatCurrency(summary.netProfit)}`;
}
