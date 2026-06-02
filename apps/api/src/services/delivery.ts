import { prisma, type DeliverySource } from "@motoboy/db";
import type {
  DeliveryCreateInput,
  ExpenseCreateInput,
  ExtractionResult,
} from "@motoboy/types";
import { getTodaySummary, formatCurrency } from "./today.js";
import { formatDeliverySource } from "./activity-labels.js";

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

function normalizeExpenseMoney(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Number((-value).toFixed(2));
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

export async function createExpenseManual(
  userId: string,
  input: ExpenseCreateInput,
) {
  const grossValue = normalizeExpenseMoney(input.grossValue);

  return prisma.delivery.create({
    data: {
      userId,
      source: "OTHER",
      grossValue,
      originName: input.originName ?? null,
      distanceKm: null,
      occurredAt: parseOccurredAt(input.occurredAt),
      rawInput: {
        channel: "app_manual",
        kind: "expense",
        payload: safePayload({
          grossValue: input.grossValue,
          originName: input.originName,
          occurredAt: input.occurredAt,
        } as DeliveryCreateInput),
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

export type DeliveryConfirmationSlice = {
  grossValue: number | { toString(): string };
  source: string;
  originName: string | null;
};

function formatConfirmLine(d: DeliveryConfirmationSlice): string {
  const value =
    typeof d.grossValue === "number"
      ? d.grossValue
      : Number(d.grossValue.toString());
  const name =
    d.originName?.trim() || formatDeliverySource(String(d.source));
  return `✅ ${formatCurrency(value)} da ${name} registrado.`;
}

/** Resposta no Zap sem consultar o banco (alvo: menos de 2s). */
export function formatDeliveryConfirmationMessage(
  created: DeliveryConfirmationSlice,
): string {
  return formatConfirmLine(created);
}

/** Confirma a entrega recém-criada (não outra do dia). */
export async function buildDeliveryConfirmation(
  userId: string,
  created: DeliveryConfirmationSlice,
): Promise<string> {
  const summary = await getTodaySummary(userId);
  return `${formatConfirmLine(created)}\nLucro de hoje: ${formatCurrency(summary.netProfit)}`;
}
