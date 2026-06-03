import type { Env } from "@motoboy/types";
import { prisma } from "@motoboy/db";
import type { FastifyBaseLogger } from "fastify";
import { SUBSCRIPTION_PRICE } from "./admin-metrics.js";
import { ensureRecurringSubscription } from "./asaas-recurring.js";

export type AsaasWebhookOptions = {
  log?: FastifyBaseLogger;
  env?: Env;
};

export type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    subscription?: string;
    externalReference?: string;
    value?: number;
    customer?: string;
  };
  subscription?: {
    id?: string;
    customer?: string;
    externalReference?: string;
    status?: string;
  };
};

const PAID_EVENTS = new Set([
  "PAYMENT_RECEIVED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED_IN_CASH",
]);

const FAILED_PAYMENT_EVENTS = new Set([
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
]);

function webhookEventId(payload: AsaasWebhookPayload): string {
  if (payload.id?.trim()) return payload.id.trim();
  const payId = payload.payment?.id ?? "";
  const subId = payload.subscription?.id ?? "";
  return `${payload.event ?? "UNKNOWN"}:${payId}:${subId}`;
}

async function findUserForPayload(payload: AsaasWebhookPayload) {
  const pay = payload.payment;
  const sub = payload.subscription;

  if (pay?.externalReference) {
    const u = await prisma.user.findUnique({
      where: { id: pay.externalReference },
    });
    if (u) return u;
  }

  if (sub?.externalReference) {
    const u = await prisma.user.findUnique({
      where: { id: sub.externalReference },
    });
    if (u) return u;
  }

  const subscriptionId = pay?.subscription ?? sub?.id;
  if (subscriptionId) {
    const u = await prisma.user.findFirst({
      where: { asaasSubscriptionId: subscriptionId },
    });
    if (u) return u;
  }

  const customerId = pay?.customer ?? sub?.customer;
  if (customerId) {
    const u = await prisma.user.findFirst({
      where: { asaasCustomerId: customerId },
    });
    if (u) return u;
  }

  return null;
}

async function upsertPaymentForCharge(
  userId: string,
  chargeId: string,
  amount: number,
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
  paidAt?: Date | null,
) {
  const existing = await prisma.payment.findFirst({
    where: { asaasChargeId: chargeId },
  });
  if (existing) {
    return prisma.payment.update({
      where: { id: existing.id },
      data: {
        status,
        ...(paidAt !== undefined ? { paidAt } : {}),
        ...(status === "PAID" && !existing.paidAt ? { paidAt: paidAt ?? new Date() } : {}),
      },
    });
  }
  return prisma.payment.create({
    data: {
      userId,
      asaasChargeId: chargeId,
      status,
      amount,
      paidAt: paidAt ?? (status === "PAID" ? new Date() : null),
    },
  });
}

async function activateUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      subscribedAt: user.subscribedAt ?? new Date(),
      trialEndsAt: null,
    },
  });
}

async function pauseUserForOverdue(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: "PAUSED" },
  });
}

async function deactivateSubscription(
  userId: string,
  clearAsaasIds = false,
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "CANCELED",
      ...(clearAsaasIds
        ? { asaasSubscriptionId: null }
        : {}),
    },
  });
}

async function handlePaymentWebhook(
  payload: AsaasWebhookPayload,
  options?: AsaasWebhookOptions,
) {
  const log = options?.log;
  const event = payload.event ?? "";
  const pay = payload.payment;
  const chargeId = pay?.id;
  if (!chargeId) {
    log?.warn({ event }, "Asaas webhook: payment sem id");
    return;
  }

  const user = await findUserForPayload(payload);
  if (!user) {
    log?.warn(
      { event, chargeId, externalReference: pay?.externalReference },
      "Asaas webhook: usuário não encontrado para cobrança",
    );
    return;
  }

  const amount =
    typeof pay?.value === "number" && pay.value > 0
      ? pay.value
      : SUBSCRIPTION_PRICE;

  if (event === "PAYMENT_CREATED") {
    await upsertPaymentForCharge(user.id, chargeId, amount, "PENDING");
    return;
  }

  const status = pay?.status;
  const isPaid =
    PAID_EVENTS.has(event) ||
    status === "RECEIVED" ||
    status === "CONFIRMED";
  const isOverdue =
    event === "PAYMENT_OVERDUE" || status === "OVERDUE";
  const isRefunded =
    event === "PAYMENT_REFUNDED" || status === "REFUNDED";
  const isFailed =
    FAILED_PAYMENT_EVENTS.has(event) || isOverdue;

  if (isPaid) {
    await upsertPaymentForCharge(user.id, chargeId, amount, "PAID", new Date());
    await activateUser(user.id);
    if (options?.env) {
      try {
        await ensureRecurringSubscription(options.env, user.id, log);
      } catch (err) {
        log?.error(
          { err, userId: user.id, chargeId },
          "Pagamento confirmado, mas falha ao garantir assinatura recorrente",
        );
      }
    }
    return;
  }

  if (isRefunded) {
    await upsertPaymentForCharge(user.id, chargeId, amount, "REFUNDED");
    return;
  }

  if (isFailed) {
    await upsertPaymentForCharge(user.id, chargeId, amount, "FAILED");
    if (isOverdue) {
      await pauseUserForOverdue(user.id);
    }
  }
}

async function handleSubscriptionWebhook(
  payload: AsaasWebhookPayload,
  options?: AsaasWebhookOptions,
) {
  const log = options?.log;
  const event = payload.event ?? "";
  const sub = payload.subscription;
  const subId = sub?.id;

  const user = await findUserForPayload(payload);
  if (!user) {
    log?.warn(
      { event, subscriptionId: subId },
      "Asaas webhook: usuário não encontrado para assinatura",
    );
    return;
  }

  if (
    event === "SUBSCRIPTION_DELETED" ||
    event === "SUBSCRIPTION_INACTIVATED"
  ) {
    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { status: true, asaasSubscriptionId: true },
    });
    const matchesSub =
      !subId || current?.asaasSubscriptionId === subId;

    // Cancelamento explícito (conta ACTIVE): encerra assinatura no app.
    // Troca Pix↔cartão ou limpeza técnica: só remove vínculo Asaas, mantém TRIAL/PAUSED.
    if (current?.status === "ACTIVE" && matchesSub) {
      await deactivateSubscription(user.id, true);
    } else if (matchesSub && current?.asaasSubscriptionId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasSubscriptionId: null },
      });
    }
    return;
  }

  if (subId && !user.asaasSubscriptionId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { asaasSubscriptionId: subId },
    });
  }
}

async function handlePixRecurringWebhook(
  payload: AsaasWebhookPayload,
  options?: AsaasWebhookOptions,
) {
  const log = options?.log;
  const event = payload.event ?? "";
  const user = await findUserForPayload(payload);
  if (!user) {
    log?.warn({ event }, "Asaas webhook: usuário não encontrado (Pix recorrente)");
    return;
  }

  if (event === "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED") {
    await activateUser(user.id);
    return;
  }

  if (event === "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED") {
    await pauseUserForOverdue(user.id);
  }
}

export async function processAsaasWebhook(
  payload: AsaasWebhookPayload,
  options?: AsaasWebhookOptions,
): Promise<void> {
  const log = options?.log;
  const eventId = webhookEventId(payload);
  const eventName = payload.event ?? "UNKNOWN";

  try {
    await prisma.asaasWebhookEvent.create({
      data: { id: eventId, event: eventName },
    });
  } catch {
    log?.info({ eventId, event: eventName }, "Asaas webhook: evento já processado");
    return;
  }

  if (
    eventName === "SUBSCRIPTION_DELETED" ||
    eventName === "SUBSCRIPTION_INACTIVATED" ||
    (payload.subscription && eventName.startsWith("SUBSCRIPTION_"))
  ) {
    await handleSubscriptionWebhook(payload, options);
    return;
  }

  if (eventName.startsWith("PIX_AUTOMATIC_RECURRING_")) {
    await handlePixRecurringWebhook(payload, options);
    return;
  }

  if (payload.payment) {
    await handlePaymentWebhook(payload, options);
    return;
  }

  log?.warn({ event: eventName }, "Asaas webhook: evento não tratado");
}
