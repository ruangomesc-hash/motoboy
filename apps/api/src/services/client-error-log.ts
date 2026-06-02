import { prisma } from "@motoboy/db";
import {
  resolveErrorCode,
  translateErrorForAdmin,
} from "../lib/client-error-translations.js";

export type RecordClientErrorInput = {
  userId?: string | null;
  errorCode?: string | null;
  rawMessage: string;
  httpStatus?: number | null;
  route?: string | null;
  method?: string | null;
  source?: "app" | "api" | "whatsapp";
  context?: Record<string, unknown> | null;
};

const DEDUP_WINDOW_MS = 2 * 60 * 1000;

export async function recordClientErrorSafe(
  input: RecordClientErrorInput,
): Promise<void> {
  try {
    await recordClientError(input);
  } catch (err) {
    console.warn("[ClientErrorLog] falha ao gravar:", err);
  }
}

export async function recordClientError(
  input: RecordClientErrorInput,
): Promise<void> {
  const errorCode = resolveErrorCode({
    code: input.errorCode,
    rawMessage: input.rawMessage,
    httpStatus: input.httpStatus,
  });

  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const duplicate = await prisma.clientErrorLog.findFirst({
    where: {
      userId: input.userId ?? null,
      errorCode,
      route: input.route ?? null,
      rawMessage: input.rawMessage.slice(0, 500),
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  if (duplicate) return;

  await prisma.clientErrorLog.create({
    data: {
      userId: input.userId ?? null,
      errorCode,
      rawMessage: input.rawMessage.slice(0, 2000),
      httpStatus: input.httpStatus ?? null,
      route: input.route?.slice(0, 500) ?? null,
      method: input.method?.slice(0, 16) ?? null,
      source: input.source ?? "app",
      context: input.context ?? undefined,
    },
  });
}

export type AdminClientErrorRow = {
  id: string;
  userId: string | null;
  userName: string | null;
  userPhone: string | null;
  userCity: string | null;
  errorCode: string;
  rawMessage: string;
  httpStatus: number | null;
  route: string | null;
  method: string | null;
  source: string;
  createdAt: string;
  adminTitle: string;
  adminDetail: string;
  adminAction: string;
  adminSeverity: "info" | "warning" | "critical";
};

export type AdminClientErrorLogs = {
  items: AdminClientErrorRow[];
  total: number;
  page: number;
  limit: number;
};

export async function getAdminClientErrorLogs(
  page: number,
  limit: number,
  filters?: { errorCode?: string; userId?: string },
): Promise<AdminClientErrorLogs> {
  const skip = (page - 1) * limit;
  const where: {
    errorCode?: string;
    userId?: string;
  } = {};
  if (filters?.errorCode && filters.errorCode !== "ALL") {
    where.errorCode = filters.errorCode;
  }
  if (filters?.userId?.trim()) {
    where.userId = filters.userId.trim();
  }

  const [rows, total] = await Promise.all([
    prisma.clientErrorLog.findMany({
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
    prisma.clientErrorLog.count({ where }),
  ]);

  return {
    items: rows.map((row) => {
      const translation = translateErrorForAdmin({
        code: row.errorCode,
        rawMessage: row.rawMessage,
        httpStatus: row.httpStatus,
        route: row.route,
      });
      return {
        id: row.id,
        userId: row.userId,
        userName: row.user?.name ?? null,
        userPhone: row.user?.whatsappNumber ?? null,
        userCity: row.user?.city ?? null,
        errorCode: row.errorCode,
        rawMessage: row.rawMessage,
        httpStatus: row.httpStatus,
        route: row.route,
        method: row.method,
        source: row.source,
        createdAt: row.createdAt.toISOString(),
        adminTitle: translation.title,
        adminDetail: translation.detail,
        adminAction: translation.action,
        adminSeverity: translation.severity,
      };
    }),
    total,
    page,
    limit,
  };
}
