import type { FastifyInstance } from "fastify";
import { prisma } from "@motocheck/db";
import {
  costUpdateSchema,
  goalUpdateSchema,
  deliveryPatchSchema,
  deliveryCreateSchema,
  profileUpdateSchema,
  goalsPlanUpdateSchema,
} from "@motocheck/types";
import {
  buildGoalsPlan,
  getUserGoalsContext,
} from "../services/goals-plan.js";
import { toUserProfile, updateUserProfile } from "../services/profile.js";
import {
  costDiffFields,
  diffValues,
  formatDeliverySource,
  formatMoney,
  getActivityHistory,
  recordActivity,
} from "../services/activity-log.js";
import { createDeliveryManual } from "../services/delivery.js";
import { getPeriodStats } from "../services/stats.js";
import { emitToUser } from "../lib/socket.js";
import {
  requireAppAccess,
  requireAuth,
  requireSessionUser,
} from "../lib/auth.js";
import { getTodaySummary } from "../services/today.js";
import { getFuelDayStats } from "../services/fuel.js";
import { getOdometerDayStats } from "../services/odometer.js";
import { optimizeRoute } from "../services/maps.js";
import { AsaasApiError } from "../lib/asaas-client.js";
import { AsaasService } from "../services/asaas.js";

export async function meRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;

  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", requireSessionUser);
  app.addHook("preHandler", requireAppAccess);

  app.get("/me", async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.sessionUser!.id },
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
      ...rest,
      profile,
      goalsPlan,
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

  app.put("/me/profile", async (request) => {
    const body = profileUpdateSchema.parse(request.body);
    return updateUserProfile(request.sessionUser!.id, body);
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

  app.get("/me/deliveries", async (request) => {
    const query = request.query as { page?: string; limit?: string; date?: string };
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 20), 50);
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      dateFilter = { occurredAt: { gte: start, lt: end } };
    }

    const [items, total] = await Promise.all([
      prisma.delivery.findMany({
        where: { userId: request.sessionUser!.id, ...dateFilter },
        orderBy: { occurredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.delivery.count({
        where: { userId: request.sessionUser!.id, ...dateFilter },
      }),
    ]);

    return { items, total, page, limit };
  });

  app.post("/me/deliveries", async (request, reply) => {
    const body = deliveryCreateSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    const delivery = await createDeliveryManual(userId, body);
    await recordActivity(userId, {
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
    });
    emitToUser(userId, "delivery:created", { id: delivery.id });
    return reply.status(201).send(delivery);
  });

  app.get("/me/deliveries/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const delivery = await prisma.delivery.findFirst({
      where: { id, userId: request.sessionUser!.id },
    });
    if (!delivery) return reply.status(404).send({ error: "Não encontrado" });
    return delivery;
  });

  app.delete("/me/deliveries/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.sessionUser!.id;
    const existing = await prisma.delivery.findFirst({
      where: { id, userId },
    });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    const deleted = await prisma.delivery.deleteMany({
      where: { id, userId },
    });
    if (deleted.count === 0) {
      return reply.status(404).send({ error: "Não encontrado" });
    }
    await recordActivity(userId, {
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
    });
    return { ok: true };
  });

  app.patch("/me/deliveries/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = deliveryPatchSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    const existing = await prisma.delivery.findFirst({
      where: { id, userId },
    });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    const updated = await prisma.delivery.updateMany({
      where: { id, userId },
      data: body,
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
        body.grossValue !== undefined && {
          field: "grossValue",
          label: "Valor",
          before: existing.grossValue,
          after: delivery.grossValue,
          format: formatMoney,
        },
        body.source !== undefined && {
          field: "source",
          label: "App",
          before: existing.source,
          after: delivery.source,
          format: formatDeliverySource,
        },
        body.originName !== undefined && {
          field: "originName",
          label: "Estabelecimento",
          before: existing.originName,
          after: delivery.originName,
        },
        body.distanceKm !== undefined && {
          field: "distanceKm",
          label: "Distância",
          before: existing.distanceKm,
          after: delivery.distanceKm,
          format: (v: unknown) => (v == null ? "—" : `${Number(v)} km`),
        },
      ].filter(Boolean) as Parameters<typeof diffValues>[0],
    );
    if (changes.length > 0) {
      await recordActivity(userId, {
        category: "DELIVERY",
        action: "UPDATED",
        title: "Entrega alterada",
        entityId: id,
        changes,
      });
    }
    return delivery;
  });

  app.get("/me/stats", async (request) => {
    const query = request.query as { period?: string };
    const period = query.period === "month" ? "month" : "week";
    return getPeriodStats(request.sessionUser!.id, period);
  });

  app.put("/me/costs", async (request) => {
    const body = costUpdateSchema.parse(request.body);
    const userId = request.sessionUser!.id;
    const before = await prisma.costConfig.findUnique({ where: { userId } });
    const result = await prisma.costConfig.upsert({
      where: { userId },
      create: { userId, ...body },
      update: body,
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

  app.post("/me/routes/optimize", async (request) => {
    const body = request.body as { addresses: string[] };
    if (!body.addresses?.length) {
      return { error: "Endereços obrigatórios" };
    }
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
      0,
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
        status: true,
        trialEndsAt: true,
        subscribedAt: true,
        subscriptionPaymentMethod: true,
      },
    });
    const lastPayment = await prisma.payment.findFirst({
      where: { userId: request.sessionUser!.id },
      orderBy: { createdAt: "desc" },
    });
    const asaas = new AsaasService(env);
    return {
      status: user?.status ?? "TRIAL",
      trialEndsAt: user?.trialEndsAt?.toISOString() ?? null,
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
      asaas: asaas.connectionStatus(),
    };
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

    const asaas = new AsaasService(env);
    try {
      const result = await asaas.createSubscription(
        request.sessionUser!.id,
        user.subscriptionPaymentMethod ?? "PIX",
      );
      return result;
    } catch (err) {
      if (err instanceof AsaasApiError) {
        return reply.status(502).send({
          error: err.message || "Erro ao conectar com Asaas",
        });
      }
      throw err;
    }
  });
}
