import type { FastifyInstance } from "fastify";
import { prisma, type DeliverySource } from "@motoboy/db";
import {
  TRIAL_DAYS,
  costUpdateSchema,
  goalUpdateSchema,
  deliveryPatchSchema,
  deliveryCreateSchema,
  expenseCreateSchema,
  expensePatchSchema,
  isExpenseEntry,
  profileUpdateSchema,
  goalsPlanUpdateSchema,
  clientErrorReportSchema,
  dailyCostExclusionBodySchema,
} from "@motoboy/types";
import { ensureTrialEndsAtPolicy } from "../services/trial.js";
import {
  buildGoalsPlan,
  getUserGoalsContext,
} from "../services/goals-plan.js";
import { toUserProfile, updateUserProfile } from "../services/profile.js";
import { migrateUserWhatsAppToCanonical } from "../services/user.js";
import {
  costDiffFields,
  diffValues,
  formatDeliverySource,
  formatMoney,
  getActivityHistory,
  recordActivity,
  recordActivitySafe,
} from "../services/activity-log.js";
import { createDeliveryManual, createExpenseManual } from "../services/delivery.js";
import { recordClientErrorSafe } from "../services/client-error-log.js";
import { getPeriodStats } from "../services/stats.js";
import {
  emitDeliveryCreated,
  emitDeliveryDeleted,
  emitDeliveryUpdated,
} from "../lib/delivery-events.js";
import {
  requireAppAccess,
  requireAuth,
  requireSessionUser,
} from "../lib/auth.js";
import { getTodaySummary, todayDateInputBrt } from "../services/today.js";
import {
  excludeDailyCost,
  listDailyCostExclusions,
  restoreDailyCost,
} from "../services/daily-cost-exclusion.js";
import { getFuelDayStats } from "../services/fuel.js";
import { getOdometerDayStats } from "../services/odometer.js";
import { optimizeRoute, RouteMapsError } from "../services/maps.js";
import { AsaasService } from "../services/asaas.js";
import {
  subscribeCreditCardHolderSchema,
  subscribeCreditCardSchema,
  subscribePaymentMethodSchema,
  subscribeRequestSchema,
} from "@motoboy/types";
import type { SubscribeCheckoutOptions } from "../services/asaas.js";
import {
  toPublicDeliveries,
  toPublicDelivery,
} from "../lib/delivery-public.js";
import { z } from "zod";
import { isProductionRuntime } from "../lib/runtime-env.js";
import {
  dayRangeFromDateInput,
  dayRangeFromDateInputInclusiveEnd,
} from "../lib/local-day-range.js";

function clientIpFromRequest(request: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]!.trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(",")[0]!.trim();
  }
  return request.ip?.trim() || "127.0.0.1";
}

const routeOptimizeSchema = z.object({
  addresses: z
    .array(z.string().trim().min(3).max(500))
    .min(2)
    .max(10),
});

export async function meRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;

  app.post(
    "/me/client-errors",
    { preHandler: [requireAuth, requireSessionUser] },
    async (request, reply) => {
      const body = clientErrorReportSchema.parse(request.body);
      await recordClientErrorSafe({
        userId: request.sessionUser!.id,
        errorCode: body.code,
        rawMessage: body.message,
        httpStatus: body.httpStatus,
        route: body.route,
        method: body.method,
        source: "app",
        context: body.context ?? null,
      });
      return reply.code(204).send();
    },
  );

  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", requireSessionUser);
  app.addHook("preHandler", requireAppAccess);

  app.get("/me", async (request) => {
    const userId = request.sessionUser!.id;
    const loginPhone = request.user?.whatsappNumber;
    if (loginPhone) {
      await migrateUserWhatsAppToCanonical(userId, loginPhone);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { costs: true, goals: { where: { active: true } } },
    });
    if (!user) return { error: "Não encontrado" };
    const { workApps, subscriptionPaymentMethod, workDays, ...rest } = user;
    const profile = toUserProfile(user);
    const { monthlyTarget, workDays: wd } = await getUserGoalsContext(
      request.sessionUser!.id,
    );
    const goalsPlan =
      monthlyTarget != null && monthlyTarget > 0
        ? buildGoalsPlan(monthlyTarget, wd)
        : null;
    return {
      profile,
      goalsPlan,
      costs: user.costs
        ? {
            fuelPricePerLiter: Number(user.costs.fuelPricePerLiter),
            kmPerLiter: Number(user.costs.kmPerLiter),
            maintenancePerKm: Number(user.costs.maintenancePerKm),
            dailyFoodCost: Number(user.costs.dailyFoodCost),
            otherDailyCost: Number(user.costs.otherDailyCost),
          }
        : null,
      status: user.status,
      trialEndsAt: user.trialEndsAt,
      subscribedAt: user.subscribedAt,
    };
  });

  app.put("/me/goals/plan", async (request) => {
    const body = goalsPlanUpdateSchema.parse(request.body);
    const userId = request.sessionUser!.id;

    if (body.workDays) {
      await prisma.user.update({
        where: { id: userId },
        data: { workDays: body.workDays },
      });
    }

    const before = await prisma.goal.findFirst({
      where: { userId, period: "MONTHLY", active: true },
    });
    await prisma.goal.updateMany({
      where: { userId, period: "MONTHLY" },
      data: { active: false },
    });
    await prisma.goal.create({
      data: {
        userId,
        period: "MONTHLY",
        targetValue: body.monthlyTarget,
      },
    });

    const { workDays } = await getUserGoalsContext(userId);
    const plan = buildGoalsPlan(body.monthlyTarget, workDays);

    const changes = diffValues([
      {
        field: "monthlyTarget",
        label: "Meta mensal",
        before: before?.targetValue,
        after: body.monthlyTarget,
        format: formatMoney,
      },
    ]);
    if (changes.length > 0) {
      await recordActivity(userId, {
        category: "GOAL",
        action: before ? "UPDATED" : "CREATED",
        title: before ? "Meta mensal alterada" : "Meta mensal definida",
        changes,
      });
    }

    return { plan };
  });

  app.get("/me/profile", async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.sessionUser!.id },
    });
    if (!user) {
      return { error: "Não encontrado" };
    }
    return toUserProfile(user);
  });

  app.put("/me/profile", async (request) => {
    const userId = request.sessionUser!.id;
    const body = profileUpdateSchema.parse(request.body);
    const profile = await updateUserProfile(userId, body);
    if (body.whatsapp !== undefined) {
      await migrateUserWhatsAppToCanonical(userId, body.whatsapp);
      const refreshed = await prisma.user.findUnique({ where: { id: userId } });
      if (refreshed) return toUserProfile(refreshed);
    }
    return profile;
  });

  app.get("/me/history", async (request) => {
    const query = request.query as { page?: string; limit?: string };
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(Math.max(1, Number(query.limit ?? 30)), 50);
    return getActivityHistory(request.sessionUser!.id, page, limit);
  });

  app.get("/me/today", async (request) => {
    return getTodaySummary(request.sessionUser!.id);
  });

  app.get("/me/deliveries", async (request, reply) => {
    const query = request.query as {
      page?: string;
      limit?: string;
      date?: string;
      from?: string;
      to?: string;
    };
    const page = Math.max(1, Number(query.page ?? 1) || 1);
    let limit = Math.min(Math.max(1, Number(query.limit ?? 20) || 20), 50);
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (query.from && query.to) {
      const fromParsed = z.string().date().safeParse(query.from);
      const toParsed = z.string().date().safeParse(query.to);
      if (!fromParsed.success || !toParsed.success) {
        return reply.status(400).send({ error: "Período inválido (from/to)" });
      }
      try {
        const { start, end } = dayRangeFromDateInputInclusiveEnd(
          fromParsed.data,
          toParsed.data,
        );
        if (end <= start) {
          return reply
            .status(400)
            .send({ error: "Data final anterior à inicial" });
        }
        dateFilter = { occurredAt: { gte: start, lt: end } };
      } catch {
        return reply.status(400).send({ error: "Período inválido (from/to)" });
      }
      limit = Math.min(Math.max(1, Number(query.limit ?? 500) || 500), 500);
    } else if (query.date) {
      const parsedDate = z.string().date().safeParse(query.date);
      if (!parsedDate.success) {
        return reply.status(400).send({ error: "Data inválida" });
      }
      try {
        const { start, end } = dayRangeFromDateInput(parsedDate.data);
        dateFilter = { occurredAt: { gte: start, lt: end } };
      } catch {
        return reply.status(400).send({ error: "Data inválida" });
      }
    }

    const [items, total] = await Promise.all([
      prisma.delivery.findMany({
        where: { userId: request.sessionUser!.id, ...dateFilter },
        orderBy: { occurredAt: "desc" },
        skip: query.from && query.to ? 0 : skip,
        take: limit,
      }),
      prisma.delivery.count({
        where: { userId: request.sessionUser!.id, ...dateFilter },
      }),
    ]);

    return {
      items: toPublicDeliveries(items),
      total,
      page: query.from && query.to ? 1 : page,
      limit,
    };
  });

  app.post("/me/deliveries", async (request, reply) => {
    const body = deliveryCreateSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    let delivery: Awaited<ReturnType<typeof createDeliveryManual>>;
    try {
      delivery = await createDeliveryManual(userId, body);
    } catch (err) {
      request.log.error(
        { err, userId, body },
        "Falha ao criar entrega manual",
      );
      return reply.status(503).send({
        error:
          "Nao foi possivel salvar a entrega agora. Verifique a conexao com o banco e tente novamente.",
        code: "DELIVERY_SAVE_FAILED",
      });
    }
    // Efeitos secundários (log/socket) não podem impedir o salvamento principal.
    try {
      await recordActivitySafe(
        userId,
        {
          category: "DELIVERY",
          action: "CREATED",
          title: "Entrega registrada",
          entityId: delivery.id,
          changes: [
            {
              field: "grossValue",
              label: "Valor",
              from: null,
              to: formatMoney(delivery.grossValue),
            },
            {
              field: "source",
              label: "Origem",
              from: null,
              to: formatDeliverySource(delivery.source),
            },
          ],
        },
        request.log,
      );
      emitDeliveryCreated(userId, delivery);
    } catch (err) {
      request.log.warn(
        { err, userId, deliveryId: delivery.id },
        "Falha em side-effects de criação de entrega",
      );
    }
    return reply.status(201).send(toPublicDelivery(delivery));
  });

  app.post("/me/expenses", async (request, reply) => {
    const body = expenseCreateSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    let expense: Awaited<ReturnType<typeof createExpenseManual>>;
    try {
      expense = await createExpenseManual(userId, body);
    } catch (err) {
      request.log.error(
        { err, userId, body },
        "Falha ao criar despesa manual",
      );
      return reply.status(503).send({
        error:
          "Nao foi possivel salvar a despesa agora. Verifique a conexao com o banco e tente novamente.",
        code: "EXPENSE_SAVE_FAILED",
      });
    }
    try {
      await recordActivitySafe(
        userId,
        {
          category: "DELIVERY",
          action: "CREATED",
          title: "Despesa registrada",
          entityId: expense.id,
          changes: [
            {
              field: "grossValue",
              label: "Valor",
              from: null,
              to: formatMoney(expense.grossValue),
            },
            {
              field: "originName",
              label: "Descrição",
              from: null,
              to: expense.originName ?? "Despesa",
            },
          ],
        },
        request.log,
      );
      emitDeliveryCreated(userId, expense);
    } catch (err) {
      request.log.warn(
        { err, userId, expenseId: expense.id },
        "Falha em side-effects de criação de despesa",
      );
    }
    return reply.status(201).send(toPublicDelivery(expense));
  });

  app.get("/me/deliveries/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const delivery = await prisma.delivery.findFirst({
      where: { id, userId: request.sessionUser!.id },
    });
    if (!delivery) return reply.status(404).send({ error: "Não encontrado" });
    return toPublicDelivery(delivery);
  });

  app.delete("/me/deliveries/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.sessionUser!.id;

    if (!id?.trim() || id.startsWith("local-")) {
      return reply.status(400).send({
        error: "Entrega ainda não foi salva no servidor. Aguarde ou atualize a lista.",
      });
    }

    const existing = await prisma.delivery.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: "Entrega não encontrada" });
    }

    const deleted = await prisma.delivery.deleteMany({
      where: { id, userId },
    });
    if (deleted.count === 0) {
      return reply.status(404).send({ error: "Entrega não encontrada" });
    }

    void recordActivitySafe(
      userId,
      {
        category: "DELIVERY",
        action: "DELETED",
        title: "Entrega removida",
        entityId: id,
        changes: [
          {
            field: "grossValue",
            label: "Valor",
            from: formatMoney(existing.grossValue),
            to: null,
          },
        ],
      },
      request.log,
    );

    emitDeliveryDeleted(userId, id);
    return reply.status(200).send({ ok: true });
  });

  app.get("/me/daily-cost-exclusions", async (request) => {
    const userId = request.sessionUser!.id;
    const q = request.query as { from?: string; to?: string };
    const from =
      typeof q.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(q.from)
        ? q.from
        : todayDateInputBrt();
    const to =
      typeof q.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(q.to)
        ? q.to
        : from;
    const items = await listDailyCostExclusions(userId, from, to);
    return { items };
  });

  app.post("/me/daily-cost-exclusions", async (request, reply) => {
    const userId = request.sessionUser!.id;
    const body = dailyCostExclusionBodySchema.parse(request.body);
    await excludeDailyCost(userId, body.dateKey, body.costKey);
    return reply.status(201).send({ ok: true });
  });

  app.delete("/me/daily-cost-exclusions", async (request, reply) => {
    const userId = request.sessionUser!.id;
    const body = dailyCostExclusionBodySchema.parse(request.body);
    await restoreDailyCost(userId, body.dateKey, body.costKey);
    return reply.status(200).send({ ok: true });
  });

  app.patch("/me/deliveries/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.sessionUser!.id;
    const existing = await prisma.delivery.findFirst({
      where: { id, userId },
    });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });

    const isExpense = isExpenseEntry(Number(existing.grossValue));

    const data: {
      grossValue?: number;
      originName?: string | null;
      distanceKm?: number | null;
      source?: DeliverySource;
      occurredAt?: Date;
    } = {};

    if (isExpense) {
      const body = expensePatchSchema.parse(request.body);
      if (body.grossValue !== undefined) {
        data.grossValue = -Number(Math.abs(body.grossValue).toFixed(2));
      }
      if (body.originName !== undefined) data.originName = body.originName;
      if (body.occurredAt !== undefined) {
        data.occurredAt = new Date(body.occurredAt);
      }
    } else {
      const body = deliveryPatchSchema.parse(request.body);
      if (body.grossValue !== undefined) data.grossValue = body.grossValue;
      if (body.originName !== undefined) data.originName = body.originName;
      if (body.distanceKm !== undefined) data.distanceKm = body.distanceKm;
      if (body.source !== undefined) data.source = body.source;
      if (body.occurredAt !== undefined) {
        data.occurredAt = new Date(body.occurredAt);
      }
    }

    const updated = await prisma.delivery.updateMany({
      where: { id, userId },
      data,
    });
    if (updated.count === 0) {
      return reply.status(404).send({ error: "Não encontrado" });
    }
    const delivery = await prisma.delivery.findFirst({
      where: { id, userId },
    });
    if (!delivery) return reply.status(404).send({ error: "Não encontrado" });
    const changes = diffValues(
      [
        data.grossValue !== undefined && {
          field: "grossValue",
          label: "Valor",
          before: existing.grossValue,
          after: delivery.grossValue,
          format: formatMoney,
        },
        data.source !== undefined && {
          field: "source",
          label: "App",
          before: existing.source,
          after: delivery.source,
          format: formatDeliverySource,
        },
        data.originName !== undefined && {
          field: "originName",
          label: isExpense ? "Descrição" : "Estabelecimento",
          before: existing.originName,
          after: delivery.originName,
        },
        data.distanceKm !== undefined && {
          field: "distanceKm",
          label: "Distância",
          before: existing.distanceKm,
          after: delivery.distanceKm,
          format: (v: unknown) => (v == null ? "—" : `${Number(v)} km`),
        },
        data.occurredAt !== undefined && {
          field: "occurredAt",
          label: "Data/hora",
          before: existing.occurredAt,
          after: delivery.occurredAt,
          format: (v: unknown) =>
            v instanceof Date ? v.toISOString() : String(v),
        },
      ].filter(Boolean) as Parameters<typeof diffValues>[0],
    );
    if (changes.length > 0) {
      await recordActivity(userId, {
        category: "DELIVERY",
        action: "UPDATED",
        title: isExpense ? "Despesa alterada" : "Entrega alterada",
        entityId: id,
        changes,
      });
    }
    emitDeliveryUpdated(userId, delivery);
    return toPublicDelivery(delivery);
  });

  app.get("/me/stats", async (request) => {
    const query = request.query as { period?: string; date?: string };
    const period = query.period === "month" ? "month" : "week";
    const anchor =
      typeof query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.date)
        ? query.date
        : new Date().toISOString().slice(0, 10);
    return getPeriodStats(request.sessionUser!.id, period, anchor);
  });

  app.put("/me/costs", async (request) => {
    const body = costUpdateSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    const before = await prisma.costConfig.findUnique({ where: { userId } });
    const now = new Date();
    const result = await prisma.costConfig.upsert({
      where: { userId },
      create: { userId, ...body, costsConfiguredAt: now },
      update: { ...body, costsConfiguredAt: now },
    });
    const changes = diffValues(
      (
        Object.keys(costDiffFields) as (keyof typeof costDiffFields)[]
      )
        .filter((key) => body[key] !== undefined)
        .map((key) => ({
          field: key,
          label: costDiffFields[key].label,
          before: before?.[key],
          after: result[key],
          format: costDiffFields[key].format,
        })),
    );
    if (changes.length > 0) {
      await recordActivity(userId, {
        category: "COSTS",
        action: before ? "UPDATED" : "CREATED",
        title: before ? "Custos atualizados" : "Custos configurados",
        changes,
      });
    }
    return result;
  });

  app.put("/me/goals", async (request) => {
    const body = goalUpdateSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    const before = await prisma.goal.findFirst({
      where: { userId, period: body.period, active: true },
    });
    await prisma.goal.updateMany({
      where: { userId, period: body.period },
      data: { active: false },
    });
    const goal = await prisma.goal.create({
      data: {
        userId,
        period: body.period,
        targetValue: body.targetValue,
      },
    });
    const periodLabel =
      body.period === "DAILY"
        ? "Meta do dia"
        : body.period === "WEEKLY"
          ? "Meta da semana"
          : "Meta do mês";
    const changes = diffValues([
      {
        field: "targetValue",
        label: periodLabel,
        before: before?.targetValue,
        after: goal.targetValue,
        format: formatMoney,
      },
    ]);
    if (changes.length > 0) {
      await recordActivity(userId, {
        category: "GOAL",
        action: before ? "UPDATED" : "CREATED",
        title: before ? `${periodLabel} alterada` : `${periodLabel} definida`,
        changes,
      });
    }
    return goal;
  });

  app.post("/me/shifts/start", async (request) => {
    return prisma.shift.create({
      data: { userId: request.sessionUser!.id, startedAt: new Date() },
    });
  });

  app.post("/me/shifts/end", async (request) => {
    const shift = await prisma.shift.findFirst({
      where: { userId: request.sessionUser!.id, endedAt: null },
      orderBy: { startedAt: "desc" },
    });
    if (!shift) return { ok: false };
    return prisma.shift.update({
      where: { id: shift.id },
      data: { endedAt: new Date() },
    });
  });

  app.post("/me/routes/optimize", async (request, reply) => {
    const body = routeOptimizeSchema.parse(request.body);
    try {
      const route = await optimizeRoute(body.addresses, env, app.log);
      await prisma.route.create({
        data: {
          userId: request.sessionUser!.id,
          addresses: body.addresses,
          optimizedOrder: route.orderedAddresses,
          totalKm: route.totalKm,
          totalMin: route.totalMin,
        },
      });
      return route;
    } catch (err) {
      if (err instanceof RouteMapsError) {
        const status =
          err.code === "MAPS_NOT_CONFIGURED" ? 503 : 400;
        return reply.status(status).send({
          error: err.message,
          code: err.code,
          ...(isProductionRuntime() ? {} : { details: err.details }),
        });
      }
      throw err;
    }
  });

  app.get("/me/fuel", async (request) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const refuels = await prisma.fuelRefuel.findMany({
      where: {
        userId: request.sessionUser!.id,
        occurredAt: { gte: start, lt: end },
      },
      orderBy: { occurredAt: "desc" },
    });
    const stats = await getFuelDayStats(
      request.sessionUser!.id,
      start,
      end,
    );
    return {
      stats,
      refuels: refuels.map((r) => ({
        id: r.id,
        totalAmount: Number(r.totalAmount),
        liters: Number(r.liters),
        pricePerLiter: Number(r.pricePerLiter),
        occurredAt: r.occurredAt.toISOString(),
        receiptPhotoUrl: r.receiptPhotoUrl,
      })),
    };
  });

  app.get("/me/odometer", async (request) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const readings = await prisma.odometerReading.findMany({
      where: {
        userId: request.sessionUser!.id,
        recordedAt: { gte: start, lt: end },
      },
      orderBy: { recordedAt: "desc" },
    });
    const user = await prisma.user.findUnique({
      where: { id: request.sessionUser!.id },
    });
    const stats = await getOdometerDayStats(
      request.sessionUser!.id,
      start,
      end,
      0,
    );
    return {
      stats,
      readings: readings.map((r) => ({
        id: r.id,
        odometerKm: Number(r.odometerKm),
        recordedAt: r.recordedAt.toISOString(),
        photoUrl: r.photoUrl,
      })),
      currentKm: user?.currentOdometerKm
        ? Number(user.currentOdometerKm)
        : null,
    };
  });

  app.get("/me/subscription", async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.sessionUser!.id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        trialEndsAt: true,
        subscribedAt: true,
        subscriptionPaymentMethod: true,
      },
    });
    const lastPayment = await prisma.payment.findFirst({
      where: { userId: request.sessionUser!.id },
      orderBy: { createdAt: "desc" },
    });
    let trialEndsAt = user?.trialEndsAt ?? null;
    if (user?.status === "TRIAL" && user.trialEndsAt) {
      trialEndsAt = await ensureTrialEndsAtPolicy({
        id: user.id,
        status: user.status,
        createdAt: user.createdAt,
        trialEndsAt: user.trialEndsAt,
      });
    }

    return {
      status: user?.status ?? "TRIAL",
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
      trialDays: TRIAL_DAYS,
      subscribedAt: user?.subscribedAt?.toISOString() ?? null,
      subscriptionPaymentMethod: user?.subscriptionPaymentMethod ?? "PIX",
      lastPayment: lastPayment
        ? {
            id: lastPayment.id,
            status: lastPayment.status,
            amount: Number(lastPayment.amount),
            createdAt: lastPayment.createdAt.toISOString(),
            paidAt: lastPayment.paidAt?.toISOString() ?? null,
          }
        : null,
      asaas: new AsaasService(env).connectionStatus(),
    };
  });

  app.get("/me/subscribe/pix/pending", async (request) => {
    const asaas = new AsaasService(env, request.log);
    const pending = await asaas.getPendingPixCheckout(request.sessionUser!.id);
    if (!pending) {
      return { pending: false as const };
    }
    return {
      pending: true as const,
      chargeId: pending.chargeId,
      amount: pending.amount,
      pixPending: true,
    };
  });

  app.get("/me/subscribe/charges/:chargeId/pix-qr", async (request, reply) => {
    const userId = request.sessionUser!.id;
    const chargeId = (request.params as { chargeId: string }).chargeId?.trim();
    if (!chargeId) {
      return reply.status(400).send({ error: "ID da cobrança inválido." });
    }

    const asaas = new AsaasService(env, request.log);
    if (!asaas.configured && isProductionRuntime()) {
      return reply.status(503).send({
        error: "Pagamento indisponível no momento.",
      });
    }

    try {
      const qr = await asaas.fetchPixQrForUserCharge(userId, chargeId);
      if (!qr) {
        return reply.status(202).send({ ready: false });
      }
      return {
        ready: true,
        pixCopyPaste: qr.pixCopyPaste,
        pixQrCodeImage: qr.pixQrCodeImage,
      };
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      const message =
        err instanceof Error ? err.message : "Erro ao buscar QR Pix";
      if (statusCode === 404) {
        return reply.status(404).send({ error: message });
      }
      request.log.error({ err, userId, chargeId }, "Pix QR poll");
      return reply.status(502).send({ error: message });
    }
  });

  app.post("/me/subscribe", async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.sessionUser!.id },
    });
    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }
    if (user.status === "ACTIVE") {
      return reply.status(400).send({ error: "Assinatura já está ativa." });
    }
    if (!user.email?.trim()) {
      return reply.status(400).send({
        error:
          "Cadastre seu e-mail no perfil antes de assinar (precisa ser o mesmo do checkout).",
      });
    }

    const parsedBody = subscribeRequestSchema.safeParse(request.body ?? {});
    if (!parsedBody.success) {
      const cpfIssue = parsedBody.error.issues.find((i) =>
        i.path.includes("cpfCnpj"),
      );
      return reply.status(400).send({
        error: cpfIssue?.message ?? "Dados de pagamento inválidos.",
      });
    }

    const methodRaw = parsedBody.data.paymentMethod;
    const methodParsed = subscribePaymentMethodSchema.safeParse(
      methodRaw ?? user.subscriptionPaymentMethod ?? "PIX",
    );
    const paymentMethod = methodParsed.success ? methodParsed.data : "PIX";
    const cpfFromBody = parsedBody.data.cpfCnpj;

    const userId = request.sessionUser!.id;
    const asaas = new AsaasService(env, request.log);

    if (!asaas.configured && isProductionRuntime()) {
      return reply.status(503).send({
        error: "Pagamento indisponível no momento. Tente mais tarde.",
      });
    }

    const checkoutOptions: SubscribeCheckoutOptions = {
      cpfCnpj: cpfFromBody ?? user.cpfCnpj ?? undefined,
      remoteIp: clientIpFromRequest(request),
    };

    if (paymentMethod === "CREDIT_CARD") {
      const cardParsed = subscribeCreditCardSchema.safeParse(
        parsedBody.data.creditCard,
      );
      const holderParsed = subscribeCreditCardHolderSchema.safeParse(
        parsedBody.data.creditCardHolderInfo,
      );
      if (!cardParsed.success || !holderParsed.success) {
        return reply.status(400).send({
          error: "Preencha todos os dados do cartão e do titular.",
        });
      }
      checkoutOptions.creditCard = cardParsed.data;
      checkoutOptions.creditCardHolderInfo = holderParsed.data;
      checkoutOptions.cpfCnpj = holderParsed.data.cpfCnpj;
    } else if (!checkoutOptions.cpfCnpj) {
      return reply.status(400).send({
        error: "Informe seu CPF para gerar a cobrança Pix.",
      });
    }

    try {
      const { withPrismaRetry } = await import("../lib/prisma-retry.js");
      await withPrismaRetry(() =>
        prisma.user.update({
          where: { id: userId },
          data: { subscriptionPaymentMethod: paymentMethod },
        }),
      );

      const { ensureBillingSchemaColumns } = await import(
        "../lib/billing-schema.js",
      );
      await ensureBillingSchemaColumns();

      const result =
        paymentMethod === "PIX"
          ? await asaas.createPixCheckout(
              userId,
              checkoutOptions.cpfCnpj!,
              request.log,
            )
          : await asaas.createSubscription(
              userId,
              paymentMethod,
              request.log,
              checkoutOptions,
            );
      return {
        amount: result.amount,
        chargeId: result.chargeId,
        paymentMethod,
        pixCopyPaste: result.pixCopyPaste ?? null,
        pixQrCodeImage: result.pixQrCodeImage ?? null,
        invoiceUrl: result.invoiceUrl ?? null,
        subscriptionId: result.subscriptionId,
        cardAuthorized: result.cardAuthorized ?? false,
        activated: result.activated ?? false,
        pixPending: result.pixPending ?? false,
      };
    } catch (err) {
      const { mapPrismaHttpError } = await import("../lib/prisma-http.js");
      const prismaMapped = mapPrismaHttpError(err);
      if (prismaMapped) {
        request.log.error(
          { err, paymentMethod, code: prismaMapped.body.code },
          "Subscribe checkout (banco)",
        );
        return reply.status(prismaMapped.status).send(prismaMapped.body);
      }

      const { mapAsaasCheckoutHttpError } = await import(
        "../lib/asaas-checkout-error.js"
      );
      const asaasMapped = mapAsaasCheckoutHttpError(err);
      if (asaasMapped) {
        request.log.error(
          { err, paymentMethod, code: asaasMapped.body.code },
          "Subscribe checkout (Asaas)",
        );
        return reply.status(asaasMapped.status).send(asaasMapped.body);
      }

      const statusCode = (err as { statusCode?: number }).statusCode;
      const code = (err as { code?: string }).code;
      const message =
        err instanceof Error ? err.message : "Erro ao abrir pagamento";
      request.log.error({ err, paymentMethod }, "Subscribe checkout");
      if (statusCode === 400) {
        return reply.status(400).send({ error: message, code });
      }
      if (statusCode === 404) {
        return reply.status(404).send({ error: message, code });
      }
      if (statusCode === 409) {
        return reply.status(409).send({ error: message, code });
      }
      if (statusCode === 503) {
        return reply.status(503).send({ error: message, code });
      }
      return reply.status(502).send({
        error: message || "Não foi possível abrir o pagamento. Tente novamente.",
        code: code ?? "CHECKOUT_ERROR",
      });
    }
  });

  app.post("/me/subscription/refresh", async (request, reply) => {
    const userId = request.sessionUser!.id;
    const asaas = new AsaasService(env, request.log);
    try {
      const result = await asaas.syncSubscriptionPaymentStatus(
        userId,
        request.log,
      );
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { status: true, subscribedAt: true },
      });
      return {
        status: result.status,
        activated: result.activated,
        subscribedAt: user?.subscribedAt?.toISOString() ?? null,
      };
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      const message =
        err instanceof Error ? err.message : "Erro ao verificar pagamento";
      if (statusCode === 404) {
        return reply.status(404).send({ error: message });
      }
      return reply.status(502).send({ error: message });
    }
  });

  app.post("/me/subscription/cancel", async (request, reply) => {
    const userId = request.sessionUser!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }
    if (user.status === "CANCELED") {
      return reply.status(400).send({ error: "Assinatura já está cancelada." });
    }
    if (user.status !== "ACTIVE" && user.status !== "PAUSED") {
      return reply.status(400).send({
        error: "Não há assinatura ativa para cancelar.",
      });
    }

    const asaas = new AsaasService(env, request.log);
    try {
      await asaas.cancelSubscription(userId, request.log);
      return { ok: true, status: "CANCELED" as const };
    } catch (err) {
      request.log.error({ err, userId }, "Cancel subscription");
      return reply.status(502).send({
        error: "Não foi possível cancelar a assinatura. Tente novamente.",
      });
    }
  });
}
