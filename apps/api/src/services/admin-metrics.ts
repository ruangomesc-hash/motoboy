import { prisma } from "@motoboy/db";
import type {
  AdminCreateUserInput,
  AdminOverview,
  AdminUsageLogs,
  AdminUserRow,
  AdminUsersList,
} from "@motoboy/types";
import { buildCsv } from "../lib/csv.js";
import { normalizePhone } from "../lib/phone.js";
import { attachReferralToUser } from "./affiliate.js";

import { TRIAL_DAYS } from "@motoboy/types";

export const SUBSCRIPTION_PRICE = 14.9;

type DelinquencyReason = "trial_expired" | "payment_pending" | "payment_failed";

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeAppUsage(createdAt: Date): {
  usageDays: number;
  usageMonths: number;
  usageRemainderDays: number;
} {
  const now = new Date();
  const start = new Date(createdAt);
  const usageDays = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / 86400000),
  );
  let usageMonths =
    now.getFullYear() * 12 +
    now.getMonth() -
    (start.getFullYear() * 12 + start.getMonth());
  let usageRemainderDays = now.getDate() - start.getDate();
  if (usageRemainderDays < 0) {
    usageMonths--;
    usageRemainderDays += new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
  }
  return {
    usageDays,
    usageMonths: Math.max(0, usageMonths),
    usageRemainderDays: Math.max(0, usageRemainderDays),
  };
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(
    0,
    Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function resolveDelinquency(
  user: {
    status: string;
    trialEndsAt: Date | null;
  },
  lastPayment: { status: string } | undefined,
  now: Date,
): {
  isDelinquent: boolean;
  delinquencyReason: DelinquencyReason | null;
  daysOverdue: number | null;
} {
  if (lastPayment?.status === "FAILED") {
    return {
      isDelinquent: true,
      delinquencyReason: "payment_failed",
      daysOverdue: null,
    };
  }
  if (lastPayment?.status === "PENDING") {
    return {
      isDelinquent: true,
      delinquencyReason: "payment_pending",
      daysOverdue: null,
    };
  }
  if (
    user.status === "TRIAL" &&
    user.trialEndsAt &&
    user.trialEndsAt < now
  ) {
    return {
      isDelinquent: true,
      delinquencyReason: "trial_expired",
      daysOverdue: daysBetween(user.trialEndsAt, now),
    };
  }
  return {
    isDelinquent: false,
    delinquencyReason: null,
    daysOverdue: null,
  };
}

function mapUserRow(
  u: {
    id: string;
    name: string | null;
    email: string | null;
    whatsappNumber: string;
    city: string | null;
    status: "TRIAL" | "ACTIVE" | "PAUSED" | "CANCELED";
    trialEndsAt: Date | null;
    subscribedAt: Date | null;
    createdAt: Date;
    affiliateCouponCode: string | null;
    referredByAffiliate: { id: string; name: string; code: string } | null;
    _count: { deliveries: number };
    payments: { status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" }[];
  },
  now: Date,
): AdminUserRow {
  const lastPayment = u.payments[0];
  const del = resolveDelinquency(u, lastPayment, now);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    whatsappNumber: u.whatsappNumber,
    city: u.city,
    affiliateId: u.referredByAffiliate?.id ?? null,
    affiliateName: u.referredByAffiliate?.name ?? null,
    affiliateCode:
      u.affiliateCouponCode ?? u.referredByAffiliate?.code ?? null,
    status: u.status,
    trialEndsAt: u.trialEndsAt?.toISOString() ?? null,
    subscribedAt: u.subscribedAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
    deliveryCount: u._count.deliveries,
    lastPaymentStatus: lastPayment?.status ?? null,
    ...del,
    ...computeAppUsage(u.createdAt),
  };
}

export async function createAdminUser(
  input: AdminCreateUserInput,
): Promise<AdminUserRow> {
  const now = new Date();
  const normalized = normalizePhone(input.whatsappNumber);
  const existing = await prisma.user.findUnique({
    where: { whatsappNumber: normalized },
  });
  if (existing) {
    throw Object.assign(new Error("WhatsApp já cadastrado"), {
      statusCode: 409,
    });
  }

  const status = input.status ?? "TRIAL";
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const user = await prisma.user.create({
    data: {
      whatsappNumber: normalized,
      name: input.name ?? null,
      city: input.city ?? null,
      status,
      trialEndsAt: status === "ACTIVE" ? null : trialEndsAt,
      subscribedAt: status === "ACTIVE" ? now : null,
      costs: { create: {} },
      goals: {
        create: {
          period: "DAILY",
          targetValue: 250,
          active: true,
        },
      },
    },
    include: userInclude,
  });

  await attachReferralToUser(user.id, input.affiliateCode);

  const refreshed = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: userInclude,
  });

  return mapUserRow(refreshed, now);
}

const userInclude = {
  referredByAffiliate: {
    select: { id: true, name: true, code: true },
  },
  _count: { select: { deliveries: true } },
  payments: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { status: true },
  },
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = daysAgo(7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = daysAgo(6);

  const delinquentWhere = {
    OR: [
      { status: "TRIAL" as const, trialEndsAt: { lt: now } },
      { payments: { some: { status: "PENDING" as const } } },
      { payments: { some: { status: "FAILED" as const } } },
    ],
  };

  const [
    total,
    active,
    trialRows,
    overdue,
    paused,
    canceled,
    pendingPayment,
    signupsToday,
    signupsWeek,
    signupsMonth,
    paidAgg,
    paidCount,
    deliveriesToday,
    deliveriesTotal,
    activeShifts,
    recentSignups,
    cityGroups,
    activeByCity,
    trialByCity,
    overdueByCity,
    newSubscribersMonth,
    newSubscribersWeek,
    churnedMonth,
    delinquentTotal,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({
      where: { status: "TRIAL", trialEndsAt: { gte: now } },
    }),
    prisma.user.count({
      where: { status: "TRIAL", trialEndsAt: { lt: now } },
    }),
    prisma.user.count({ where: { status: "PAUSED" } }),
    prisma.user.count({ where: { status: "CANCELED" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { status: "PAID", paidAt: { gte: monthStart } },
    }),
    prisma.delivery.count({
      where: { occurredAt: { gte: todayStart } },
    }),
    prisma.delivery.count(),
    prisma.shift.count({ where: { endedAt: null } }),
    prisma.user.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { createdAt: true },
    }),
    prisma.user.groupBy({
      by: ["city"],
      _count: { id: true },
      where: { city: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 15,
    }),
    prisma.user.groupBy({
      by: ["city"],
      _count: { id: true },
      where: { city: { not: null }, status: "ACTIVE" },
    }),
    prisma.user.groupBy({
      by: ["city"],
      _count: { id: true },
      where: {
        city: { not: null },
        status: "TRIAL",
        trialEndsAt: { gte: now },
      },
    }),
    prisma.user.groupBy({
      by: ["city"],
      _count: { id: true },
      where: {
        city: { not: null },
        status: "TRIAL",
        trialEndsAt: { lt: now },
      },
    }),
    prisma.user.count({
      where: { subscribedAt: { gte: monthStart } },
    }),
    prisma.user.count({
      where: { subscribedAt: { gte: weekStart } },
    }),
    prisma.user.count({
      where: {
        status: "CANCELED",
        updatedAt: { gte: monthStart },
      },
    }),
    prisma.user.count({ where: delinquentWhere }),
  ]);

  const usersWithDeliveries = await prisma.user.findMany({
    where: { city: { not: null } },
    select: {
      city: true,
      _count: { select: { deliveries: true } },
    },
  });
  const deliveryCountByCity = new Map<string, number>();
  for (const u of usersWithDeliveries) {
    if (!u.city) continue;
    deliveryCountByCity.set(
      u.city,
      (deliveryCountByCity.get(u.city) ?? 0) + u._count.deliveries,
    );
  }

  const last7Days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    last7Days.push({ date: formatDateKey(d), count: 0 });
  }
  const dayIndex = new Map(last7Days.map((p, i) => [p.date, i]));
  for (const u of recentSignups) {
    const key = formatDateKey(u.createdAt);
    const idx = dayIndex.get(key);
    if (idx !== undefined) {
      const point = last7Days[idx];
      if (point) point.count += 1;
    }
  }

  const mapCount = (rows: { city: string | null; _count: { id: number } }[]) =>
    new Map(
      rows
        .filter((r) => r.city)
        .map((r) => [r.city!, r._count.id]),
    );

  const activeMap = mapCount(activeByCity);
  const trialMap = mapCount(trialByCity);
  const overdueMap = mapCount(overdueByCity);

  const regions = cityGroups.map((g) => {
    const city = g.city ?? "Sem cidade";
    return {
      city,
      total: g._count.id,
      active: activeMap.get(city) ?? 0,
      trial: trialMap.get(city) ?? 0,
      overdue: overdueMap.get(city) ?? 0,
      deliveries: deliveryCountByCity.get(city) ?? 0,
    };
  });

  const paidSum = Number(paidAgg._sum.amount ?? 0);
  const mrr = active * SUBSCRIPTION_PRICE;
  const baseForChurn = active + churnedMonth;
  const churnRatePercent =
    baseForChurn > 0
      ? Math.round((churnedMonth / baseForChurn) * 1000) / 10
      : 0;

  return {
    generatedAt: now.toISOString(),
    subscriptionPrice: SUBSCRIPTION_PRICE,
    trialDays: TRIAL_DAYS,
    users: {
      total,
      active,
      trial: trialRows,
      overdue,
      paused,
      canceled,
      pendingPayment,
    },
    signups: {
      today: signupsToday,
      week: signupsWeek,
      month: signupsMonth,
      last7Days,
    },
    revenue: {
      mrr,
      paidThisMonth: paidSum,
      paidCountThisMonth: paidCount,
    },
    growth: {
      newSubscribersMonth,
      newSubscribersWeek,
      churnedMonth,
      churnRatePercent,
      delinquentTotal,
    },
    operations: {
      deliveriesToday,
      deliveriesTotal,
      activeShifts,
      avgDeliveriesPerActiveUser:
        active > 0 ? Math.round((deliveriesToday / active) * 10) / 10 : 0,
    },
    regions,
  };
}

const EXPORT_BATCH_SIZE = 250;

const STATUS_EXPORT_LABEL: Record<AdminUserRow["status"], string> = {
  ACTIVE: "Ativo",
  TRIAL: "Trial",
  PAUSED: "Pausado",
  CANCELED: "Cancelado",
};

const PAYMENT_EXPORT_LABEL: Record<
  NonNullable<AdminUserRow["lastPaymentStatus"]>,
  string
> = {
  PENDING: "Pendente",
  PAID: "Pago",
  FAILED: "Falhou",
  REFUNDED: "Estornado",
};

const DELINQUENCY_EXPORT_LABEL: Record<
  NonNullable<AdminUserRow["delinquencyReason"]>,
  string
> = {
  trial_expired: "Trial vencido",
  payment_pending: "Cobrança pendente",
  payment_failed: "Pagamento falhou",
};

function usersWhereFromStatus(status?: string) {
  if (!status || status === "ALL") return undefined;
  return { status: status as "TRIAL" | "ACTIVE" | "PAUSED" | "CANCELED" };
}

function formatIsoDateBr(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

function adminUserRowToCsvCells(row: AdminUserRow): string[] {
  const usageParts: string[] = [];
  if (row.usageMonths > 0) {
    usageParts.push(
      row.usageMonths === 1 ? "1 mês" : `${row.usageMonths} meses`,
    );
  }
  if (row.usageRemainderDays > 0 || row.usageMonths === 0) {
    usageParts.push(
      row.usageRemainderDays === 1
        ? "1 dia"
        : `${row.usageRemainderDays} dias`,
    );
  }
  const tempoNoApp =
    usageParts.length > 0 ? usageParts.join(" e ") : "Hoje";

  return [
    row.id,
    row.name ?? "",
    row.email ?? "",
    row.whatsappNumber,
    row.city ?? "",
    STATUS_EXPORT_LABEL[row.status],
    formatIsoDateBr(row.createdAt),
    formatIsoDateBr(row.trialEndsAt),
    formatIsoDateBr(row.subscribedAt),
    row.affiliateCode ?? "",
    row.affiliateName ?? "",
    String(row.deliveryCount),
    row.lastPaymentStatus
      ? PAYMENT_EXPORT_LABEL[row.lastPaymentStatus]
      : "",
    row.isDelinquent ? "Sim" : "Não",
    row.delinquencyReason
      ? DELINQUENCY_EXPORT_LABEL[row.delinquencyReason]
      : "",
    row.daysOverdue != null ? String(row.daysOverdue) : "",
    tempoNoApp,
    String(row.usageDays),
  ];
}

const CLIENT_CSV_HEADERS = [
  "ID",
  "Nome",
  "E-mail",
  "WhatsApp",
  "Cidade",
  "Status",
  "Cadastro",
  "Trial (resumo)",
  "Trial até",
  "Assinante desde",
  "Cupom indicação",
  "Afiliado",
  "Entregas",
  "Último pagamento",
  "Inadimplente",
  "Motivo inadimplência",
  "Dias em atraso",
  "Tempo no app",
  "Dias no app (total)",
];

/** Exporta 100% dos clientes (lotes no servidor, sem limite de paginação da UI). */
export async function exportAllAdminUsersCsv(status?: string): Promise<{
  csv: string;
  total: number;
}> {
  const now = new Date();
  const baseWhere = usersWhereFromStatus(status);
  const rows: AdminUserRow[] = [];
  let lastId: string | undefined;

  for (;;) {
    const batch = await prisma.user.findMany({
      where: lastId
        ? { ...baseWhere, id: { gt: lastId } }
        : baseWhere,
      orderBy: { id: "asc" },
      take: EXPORT_BATCH_SIZE,
      include: userInclude,
    });
    if (batch.length === 0) break;
    for (const u of batch) {
      rows.push(mapUserRow(u, now));
    }
    lastId = batch[batch.length - 1]?.id;
    if (batch.length < EXPORT_BATCH_SIZE) break;
  }

  const csv = buildCsv(
    CLIENT_CSV_HEADERS,
    rows.map((r) => adminUserRowToCsvCells(r)),
  );

  return { csv, total: rows.length };
}

export async function getAdminUsersList(
  page: number,
  limit: number,
  status?: string,
): Promise<AdminUsersList> {
  const now = new Date();
  const skip = (page - 1) * limit;
  const where = usersWhereFromStatus(status);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: userInclude,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map((u) => mapUserRow(u, now)),
    total,
    page,
    limit,
  };
}

export async function getAdminDelinquentList(
  page: number,
  limit: number,
): Promise<AdminUsersList> {
  const now = new Date();
  const skip = (page - 1) * limit;
  const where = {
    OR: [
      { status: "TRIAL" as const, trialEndsAt: { lt: now } },
      { payments: { some: { status: "PENDING" as const } } },
      { payments: { some: { status: "FAILED" as const } } },
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ trialEndsAt: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: userInclude,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map((u) => mapUserRow(u, now)),
    total,
    page,
    limit,
  };
}

function summarizeChanges(changes: unknown): string | null {
  if (!Array.isArray(changes) || changes.length === 0) return null;
  return changes
    .slice(0, 2)
    .map((c) => {
      const row = c as { label?: string; from?: string; to?: string };
      return `${row.label ?? "?"}: ${row.from ?? "—"} → ${row.to ?? "—"}`;
    })
    .join("; ");
}

export async function getAdminUsageLogs(
  page: number,
  limit: number,
  category?: string,
): Promise<AdminUsageLogs> {
  const skip = (page - 1) * limit;
  const where =
    category && category !== "ALL"
      ? { category: category as "PROFILE" | "COSTS" | "GOAL" | "DELIVERY" | "FUEL" | "ODOMETER" | "SHIFT" }
      : undefined;

  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, whatsappNumber: true, city: true },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userName: row.user.name,
      userPhone: row.user.whatsappNumber,
      userCity: row.user.city,
      category: row.category,
      action: row.action,
      title: row.title,
      source: row.source === "whatsapp" ? "whatsapp" : "app",
      changesSummary: summarizeChanges(row.changes),
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}
