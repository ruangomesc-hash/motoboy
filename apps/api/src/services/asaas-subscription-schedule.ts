import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "@motoboy/db";
import {
  asaasRequest,
  AsaasApiError,
  isAsaasConfigured,
} from "../lib/asaas-client.js";
import {
  formatAsaasDueDate,
  isPaymentSettledAfterDueDate,
  nextDueDateAfterPayment,
  nextDueDateOnBillingDay,
} from "../lib/billing-calendar.js";
import type { AsaasRequestContext } from "../lib/asaas-request-log.js";

type AsaasSubscriptionDetail = {
  id: string;
  nextDueDate?: string;
  billingType?: string;
  status?: string;
  deleted?: boolean;
};

type AsaasPaymentDue = { dueDate?: string };

export type ScheduleSubscriptionBillingInput = {
  subscriptionId: string;
  paidAt: Date;
  subscribedAt: Date | null;
  wasOverdue: boolean;
  isFirstPayment: boolean;
  /** Pagamento pelo app sobrescreve data definida antes no admin. */
  forceOverwrite?: boolean;
};

export type PaidSubscriptionBillingInput = {
  userId: string;
  chargeId: string;
  paidAt: Date;
  user: {
    status: string;
    subscribedAt: Date | null;
    asaasSubscriptionId: string | null;
    subscriptionPaymentMethod?: string | null;
  };
  linkedSubscriptionId: string | null;
  paymentDueDate?: string | null;
  chargeKind?: string | null;
  billingType?: string | null;
};

/** Pagamento de assinatura pelo app (não cobrança avulsa de suporte/admin). */
export function isAppSubscriptionPayment(input: {
  chargeKind?: string | null;
  linkedSubscriptionId?: string | null;
}): boolean {
  if (input.chargeKind === "SUPPORT") return false;
  if (input.chargeKind === "SUBSCRIPTION") return true;
  if (input.linkedSubscriptionId) return true;
  return false;
}

export function resolvePaidSubscriptionBilling(input: PaidSubscriptionBillingInput): {
  subscribedAtAfter: Date;
  wasOverdue: boolean;
  isFirstPayment: boolean;
  forceOverwrite: boolean;
  fromApp: boolean;
} {
  const fromApp = isAppSubscriptionPayment({
    chargeKind: input.chargeKind,
    linkedSubscriptionId: input.linkedSubscriptionId,
  });

  const wasOverdue =
    input.user.status === "PAUSED" ||
    isPaymentSettledAfterDueDate(input.paidAt, input.paymentDueDate);

  const paidDay = formatAsaasDueDate(input.paidAt);
  const subscribedDay = input.user.subscribedAt
    ? formatAsaasDueDate(input.user.subscribedAt)
    : null;

  const resetAnchorFromApp =
    fromApp && (!subscribedDay || paidDay !== subscribedDay);

  const subscribedAtAfter =
    resetAnchorFromApp || !input.user.subscribedAt
      ? input.paidAt
      : input.user.subscribedAt;

  return {
    subscribedAtAfter,
    wasOverdue,
    isFirstPayment: resetAnchorFromApp || !input.user.subscribedAt,
    forceOverwrite: resetAnchorFromApp || wasOverdue,
    fromApp,
  };
}

async function inactivateStaleAsaasSubscription(
  env: Env,
  subscriptionId: string,
  ctx: AsaasRequestContext,
): Promise<void> {
  try {
    await asaasRequest(
      env,
      `/subscriptions/${subscriptionId}`,
      { method: "DELETE" },
      { ...ctx, operation: "inactivateStaleSubscription" },
    );
  } catch (err) {
    if (err instanceof AsaasApiError && err.statusCode === 404) return;
    throw err;
  }
}

/**
 * Após pagamento confirmado: atualiza âncora no banco e grava próximo vencimento no Asaas.
 * Pagamento pelo app sempre sobrepõe configuração anterior do admin.
 */
export async function applyPaidSubscriptionBilling(
  env: Env,
  input: PaidSubscriptionBillingInput,
  log?: FastifyBaseLogger,
): Promise<{
  subscribedAtAfter: Date;
  subscriptionId: string | null;
}> {
  const ctx: AsaasRequestContext = {
    log,
    operation: "applyPaidSubscriptionBilling",
  };

  const billing = resolvePaidSubscriptionBilling(input);
  const subscriptionId =
    input.linkedSubscriptionId?.trim() ||
    input.user.asaasSubscriptionId?.trim() ||
    null;

  const paymentMethod =
    input.billingType === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX";

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      status: "ACTIVE",
      subscribedAt: billing.subscribedAtAfter,
      trialEndsAt: null,
      subscriptionPaymentMethod: paymentMethod,
      ...(subscriptionId ? { asaasSubscriptionId: subscriptionId } : {}),
    },
  });

  if (
    subscriptionId &&
    input.user.asaasSubscriptionId &&
    input.user.asaasSubscriptionId !== subscriptionId
  ) {
    log?.info(
      {
        userId: input.userId,
        from: input.user.asaasSubscriptionId,
        to: subscriptionId,
      },
      "Assinatura Asaas do app substitui vínculo anterior (admin)",
    );
    void inactivateStaleAsaasSubscription(
      env,
      input.user.asaasSubscriptionId,
      ctx,
    ).catch((err) => {
      log?.warn(
        { err, userId: input.userId, oldSubscriptionId: input.user.asaasSubscriptionId },
        "Falha ao inativar assinatura Asaas antiga",
      );
    });
  }

  if (subscriptionId && isAsaasConfigured(env)) {
    await scheduleNextSubscriptionBilling(
      env,
      {
        subscriptionId,
        paidAt: input.paidAt,
        subscribedAt: billing.subscribedAtAfter,
        wasOverdue: billing.wasOverdue,
        isFirstPayment: billing.isFirstPayment,
        forceOverwrite: billing.forceOverwrite,
      },
      log,
    );
  } else if (billing.fromApp && isAsaasConfigured(env)) {
    const { ensureRecurringSubscription } = await import("./asaas-recurring.js");
    await ensureRecurringSubscription(env, input.userId, log);
    await reconcileAsaasSubscriptionBilling(env, input.userId, log);
  }

  if (billing.fromApp) {
    log?.info(
      {
        userId: input.userId,
        chargeId: input.chargeId,
        subscribedAt: billing.subscribedAtAfter,
        subscriptionId,
        forceOverwrite: billing.forceOverwrite,
      },
      "Ciclo de cobrança do app aplicado (sobrepõe admin)",
    );
  }

  return { subscribedAtAfter: billing.subscribedAtAfter, subscriptionId };
}

export type BillingScheduleContext = {
  subscribedAt: Date;
  status: string;
  lastPaidAt: Date | null;
  lastPaidWasOverdue: boolean;
  isFirstPayment?: boolean;
  now?: Date;
};

/** Calcula o próximo vencimento esperado (regra de negócio Motocopiloto). */
export function computeExpectedNextDueDate(ctx: BillingScheduleContext): string {
  const now = ctx.now ?? new Date();

  if (ctx.lastPaidWasOverdue && ctx.lastPaidAt) {
    return nextDueDateAfterPayment(ctx.lastPaidAt);
  }

  if (ctx.isFirstPayment) {
    return nextDueDateAfterPayment(ctx.subscribedAt);
  }

  const firstCycleEnd = nextDueDateAfterPayment(ctx.subscribedAt);
  const firstCycleEndDate = new Date(`${firstCycleEnd}T23:59:59`);
  if (now <= firstCycleEndDate) {
    return firstCycleEnd;
  }

  return nextDueDateOnBillingDay(ctx.subscribedAt, now);
}

function normalizeDueDay(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;
  return value.trim().slice(0, 10);
}

async function fetchAsaasSubscription(
  env: Env,
  subscriptionId: string,
  ctx: AsaasRequestContext,
): Promise<AsaasSubscriptionDetail | null> {
  try {
    return await asaasRequest<AsaasSubscriptionDetail>(
      env,
      `/subscriptions/${subscriptionId}`,
      {},
      { ...ctx, operation: "getSubscriptionForSchedule" },
    );
  } catch (err) {
    if (err instanceof AsaasApiError && err.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

async function pushNextDueDateToAsaas(
  env: Env,
  subscriptionId: string,
  nextDueDate: string,
  updatePendingPayments: boolean,
  ctx: AsaasRequestContext,
): Promise<void> {
  await asaasRequest(
    env,
    `/subscriptions/${subscriptionId}`,
    {
      method: "POST",
      body: JSON.stringify({
        nextDueDate,
        updatePendingPayments,
      }),
    },
    { ...ctx, operation: "updateSubscriptionNextDueDate" },
  );
}

/**
 * Atualiza no Asaas o vencimento da próxima mensalidade após um pagamento.
 */
export async function scheduleNextSubscriptionBilling(
  env: Env,
  input: ScheduleSubscriptionBillingInput,
  log?: FastifyBaseLogger,
): Promise<string | null> {
  if (!isAsaasConfigured(env)) return null;

  const ctx: AsaasRequestContext = {
    log,
    operation: "scheduleNextSubscriptionBilling",
  };

  let nextDueDate: string;
  let updatePendingPayments = Boolean(
    input.wasOverdue || input.forceOverwrite,
  );

  if (input.wasOverdue) {
    nextDueDate = nextDueDateAfterPayment(input.paidAt);
  } else if (input.isFirstPayment) {
    const anchor = input.subscribedAt ?? input.paidAt;
    nextDueDate = nextDueDateAfterPayment(anchor);
  } else if (input.subscribedAt) {
    nextDueDate = nextDueDateOnBillingDay(input.subscribedAt, input.paidAt);
  } else {
    nextDueDate = nextDueDateAfterPayment(input.paidAt);
  }

  try {
    await pushNextDueDateToAsaas(
      env,
      input.subscriptionId,
      nextDueDate,
      updatePendingPayments,
      ctx,
    );
    log?.info(
      {
        subscriptionId: input.subscriptionId,
        nextDueDate,
        wasOverdue: input.wasOverdue,
        isFirstPayment: input.isFirstPayment,
      },
      "Próximo vencimento gravado no Asaas",
    );
    return nextDueDate;
  } catch (err) {
    if (err instanceof AsaasApiError) {
      log?.warn(
        { err, subscriptionId: input.subscriptionId, nextDueDate },
        "Falha ao gravar próximo vencimento no Asaas",
      );
      return null;
    }
    throw err;
  }
}

async function resolveLastPaidWasOverdue(
  env: Env,
  asaasChargeId: string | null,
  paidAt: Date,
  ctx: AsaasRequestContext,
): Promise<boolean> {
  if (!asaasChargeId || !isAsaasConfigured(env)) return false;
  try {
    const remote = await asaasRequest<AsaasPaymentDue>(
      env,
      `/payments/${asaasChargeId}`,
      {},
      { ...ctx, operation: "getPaymentDueForSchedule" },
    );
    return isPaymentSettledAfterDueDate(paidAt, remote.dueDate);
  } catch {
    return false;
  }
}

/**
 * Garante que o Asaas tenha o próximo vencimento alinhado ao dia do 1º pagamento.
 * Retorna a data configurada no Asaas (após reconciliação).
 */
export async function reconcileAsaasSubscriptionBilling(
  env: Env,
  userId: string,
  log?: FastifyBaseLogger,
): Promise<string | null> {
  if (!isAsaasConfigured(env)) return null;

  const ctx: AsaasRequestContext = {
    log,
    operation: "reconcileAsaasSubscriptionBilling",
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.status !== "ACTIVE") return null;

  const lastAppPayment = await prisma.payment.findFirst({
    where: {
      userId,
      status: "PAID",
      chargeKind: "SUBSCRIPTION",
      paidAt: { not: null },
    },
    orderBy: { paidAt: "desc" },
  });

  let billingAnchor = user?.subscribedAt ?? null;
  if (lastAppPayment?.paidAt) {
    billingAnchor = lastAppPayment.paidAt;
    if (
      user?.subscribedAt &&
      formatAsaasDueDate(user.subscribedAt) !==
        formatAsaasDueDate(lastAppPayment.paidAt)
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscribedAt: lastAppPayment.paidAt },
      });
      log?.info(
        { userId, subscribedAt: lastAppPayment.paidAt },
        "subscribedAt alinhado ao último pagamento pelo app",
      );
    }
  }

  if (!billingAnchor) return null;

  let subscriptionId = user?.asaasSubscriptionId ?? null;
  if (!subscriptionId) {
    const { ensureRecurringSubscription } = await import("./asaas-recurring.js");
    subscriptionId = await ensureRecurringSubscription(env, userId, log);
    if (!subscriptionId) return null;
  }

  const lastPaid = await prisma.payment.findFirst({
    where: { userId, status: "PAID", paidAt: { not: null } },
    orderBy: { paidAt: "desc" },
  });

  const lastPaidAt = lastPaid?.paidAt ?? null;
  const lastPaidWasOverdue =
    lastPaidAt != null
      ? await resolveLastPaidWasOverdue(
          env,
          lastPaid?.asaasChargeId ?? null,
          lastPaidAt,
          ctx,
        )
      : false;

  const isFirstPayment =
    lastPaidAt != null &&
    formatAsaasDueDate(lastPaidAt) === formatAsaasDueDate(billingAnchor);

  const expected = computeExpectedNextDueDate({
    subscribedAt: billingAnchor,
    status: user!.status,
    lastPaidAt,
    lastPaidWasOverdue,
    isFirstPayment,
  });

  const remote = await fetchAsaasSubscription(env, subscriptionId, ctx);
  if (!remote?.id) {
    return null;
  }

  if (remote.billingType === "CREDIT_CARD" || remote.billingType === "PIX") {
    const paymentMethod =
      remote.billingType === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX";
    if (user!.subscriptionPaymentMethod !== paymentMethod) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionPaymentMethod: paymentMethod },
      });
      log?.info(
        { userId, subscriptionId, paymentMethod },
        "Forma de cobrança alinhada à assinatura Asaas",
      );
    }
  }

  const current = normalizeDueDay(remote.nextDueDate);
  if (current === expected) {
    log?.info(
      { userId, subscriptionId, nextDueDate: expected },
      "Asaas já com próximo vencimento correto",
    );
    return expected;
  }

  const mustForceUpdate = current != null && current !== expected;

  try {
    await pushNextDueDateToAsaas(
      env,
      subscriptionId,
      expected,
      mustForceUpdate,
      ctx,
    );
    log?.info(
      {
        userId,
        subscriptionId,
        from: current,
        to: expected,
      },
      "Próximo vencimento corrigido no Asaas",
    );
    return expected;
  } catch (err) {
    if (err instanceof AsaasApiError) {
      log?.warn(
        { err, userId, subscriptionId, expected },
        "Falha ao reconciliar vencimento no Asaas",
      );
      return current;
    }
    throw err;
  }
}
