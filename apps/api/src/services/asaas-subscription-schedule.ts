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
};

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
  let updatePendingPayments = false;

  if (input.wasOverdue) {
    nextDueDate = nextDueDateAfterPayment(input.paidAt);
    updatePendingPayments = true;
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
  if (!user?.subscribedAt) return null;
  if (user.status !== "ACTIVE") return null;

  let subscriptionId = user.asaasSubscriptionId;
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
    formatAsaasDueDate(lastPaidAt) === formatAsaasDueDate(user.subscribedAt);

  const expected = computeExpectedNextDueDate({
    subscribedAt: user.subscribedAt,
    status: user.status,
    lastPaidAt,
    lastPaidWasOverdue,
    isFirstPayment,
  });

  const remote = await fetchAsaasSubscription(env, subscriptionId, ctx);
  if (!remote?.id) {
    return null;
  }

  const current = normalizeDueDay(remote.nextDueDate);
  if (current === expected) {
    log?.info(
      { userId, subscriptionId, nextDueDate: expected },
      "Asaas já com próximo vencimento correto",
    );
    return expected;
  }

  try {
    await pushNextDueDateToAsaas(
      env,
      subscriptionId,
      expected,
      false,
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
