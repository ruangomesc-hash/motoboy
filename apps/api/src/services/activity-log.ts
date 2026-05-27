import { prisma, type ActivityAction, type ActivityCategory } from "@motoboy/db";
import type { ActivityChange, ActivityHistory } from "@motoboy/types";
import {
  formatDeliverySource,
  formatMoney,
  formatPlain,
  formatSubscriptionPayment,
  formatWorkApps,
  formatWorkDaysList,
} from "./activity-labels.js";

type RecordInput = {
  category: ActivityCategory;
  action: ActivityAction;
  title: string;
  changes: ActivityChange[];
  entityId?: string;
  source?: "app" | "whatsapp";
};

export async function recordActivity(
  userId: string,
  input: RecordInput,
): Promise<void> {
  if (input.changes.length === 0 && input.action === "UPDATED") return;

  await prisma.activityLog.create({
    data: {
      userId,
      category: input.category,
      action: input.action,
      title: input.title,
      changes: input.changes,
      entityId: input.entityId,
      source: input.source ?? "app",
    },
  });
}

/** Não falha a operação principal (ex.: apagar entrega) se o histórico não gravar. */
export async function recordActivitySafe(
  userId: string,
  input: RecordInput,
  log?: { warn: (obj: unknown, msg?: string) => void },
): Promise<void> {
  try {
    await recordActivity(userId, input);
  } catch (err) {
    log?.warn({ err, userId, input }, "Falha ao gravar ActivityLog");
  }
}

export function diffValues(
  fields: {
    field: string;
    label: string;
    before: unknown;
    after: unknown;
    format?: (v: unknown) => string;
  }[],
): ActivityChange[] {
  const fmt = (f: (v: unknown) => string | undefined, v: unknown) =>
    f ? f(v) : formatPlain(v);

  return fields
    .filter(({ before, after }) => {
      const b = before === undefined ? null : before;
      const a = after === undefined ? null : after;
      return JSON.stringify(b) !== JSON.stringify(a);
    })
    .map(({ field, label, before, after, format }) => ({
      field,
      label,
      from: fmt(format ?? formatPlain, before ?? null) ?? "—",
      to: fmt(format ?? formatPlain, after ?? null) ?? "—",
    }));
}

export async function getActivityHistory(
  userId: string,
  page: number,
  limit: number,
): Promise<ActivityHistory> {
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where: { userId } }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      category: row.category,
      action: row.action,
      title: row.title,
      changes: row.changes as ActivityChange[],
      entityId: row.entityId,
      source: row.source === "whatsapp" ? "whatsapp" : "app",
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}

export const profileDiffFields = {
  name: { label: "Nome", format: formatPlain },
  email: { label: "E-mail", format: formatPlain },
  city: { label: "Cidade", format: formatPlain },
  workApps: { label: "Apps", format: formatWorkApps },
  subscriptionPaymentMethod: {
    label: "Pagamento da assinatura",
    format: formatSubscriptionPayment,
  },
  workDays: { label: "Dias trabalhados", format: formatWorkDaysList },
} as const;

export const costDiffFields = {
  fuelPricePerLiter: { label: "Gasolina (R$/L)", format: formatMoney },
  kmPerLiter: { label: "Km por litro", format: formatPlain },
  maintenancePerKm: { label: "Manutenção (R$/km)", format: formatMoney },
  otherDailyCost: { label: "Outros custos/dia", format: formatMoney },
} as const;

export { formatDeliverySource, formatMoney };
