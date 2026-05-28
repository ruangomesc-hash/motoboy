import { prisma, type DeliverySource } from "@motoboy/db";
import type {
  DeliveryCreateInput,
  ExtractionResult,
} from "@motoboy/types";
import { getTodaySummary, formatCurrency } from "./today.js";

function parseOccurredAt(iso?: string): Date {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function safePayload(input: DeliveryCreateInput): object {
  try {
    return JSON.parse(JSON.stringify(input)) as object;
  } catch {
    return {};
  }
}

function normalizeMoney(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Number(value.toFixed(2));
}

function normalizeDistance(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (!Number.isFinite(value) || value < 0) return null;
  return Number(value.toFixed(2));
}

export async function createDeliveryManual(
  userId: string,
  input: DeliveryCreateInput,
) {
  const grossValue = normalizeMoney(input.grossValue);
  const distanceKm = normalizeDistance(input.distanceKm);

  return prisma.delivery.create({
    data: {
      userId,
      source: input.source as DeliverySource,
      grossValue,
      originName: input.originName ?? null,
      destinationAddr: input.destinationAddr ?? null,
      distanceKm,
      occurredAt: parseOccurredAt(input.occurredAt),
      rawInput: {
        channel: "app_manual",
        payload: safePayload(input),
      },
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
