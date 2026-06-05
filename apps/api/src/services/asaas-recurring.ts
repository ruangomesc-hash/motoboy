import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "@motoboy/db";
import {
  asaasRequest,
  AsaasApiError,
  isAsaasConfigured,
  toAsaasBillingType,
} from "../lib/asaas-client.js";
import { SUBSCRIPTION_PRICE } from "./admin-metrics.js";
import type { AsaasRequestContext } from "../lib/asaas-request-log.js";
import { nextDueDateOnBillingDay } from "../lib/billing-calendar.js";
import { reconcileAsaasSubscriptionBilling } from "./asaas-subscription-schedule.js";

type AsaasSubscriptionDetail = {
  id: string;
  status?: string;
  deleted?: boolean;
};

type AsaasCustomer = { id: string; deleted?: boolean };

/**
 * Garante assinatura recorrente no Asaas após pagamento (ex.: cobrança avulsa do suporte).
 * Renovações seguintes passam a ser automáticas via Asaas + webhook.
 */
export async function ensureRecurringSubscription(
  env: Env,
  userId: string,
  log?: FastifyBaseLogger,
): Promise<string | null> {
  const ctx: AsaasRequestContext = { log, operation: "ensureRecurringSubscription" };

  if (!isAsaasConfigured(env)) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return null;
  }

  let customerId = user.asaasCustomerId;
  if (!customerId) {
    return null;
  }

  if (user.asaasSubscriptionId) {
    try {
      const existing = await asaasRequest<AsaasSubscriptionDetail>(
        env,
        `/subscriptions/${user.asaasSubscriptionId}`,
        {},
        ctx,
      );
      const inactive =
        existing.deleted ||
        existing.status === "INACTIVE" ||
        existing.status === "EXPIRED";
      if (existing.id && !inactive) {
        try {
          await reconcileAsaasSubscriptionBilling(env, userId, log);
        } catch (err) {
          log?.warn(
            { err, userId, subscriptionId: existing.id },
            "Falha ao reconciliar vencimento da assinatura existente",
          );
        }
        return existing.id;
      }
    } catch (err) {
      if (!(err instanceof AsaasApiError) || err.statusCode !== 404) {
        throw err;
      }
    }
  }

  try {
    const customer = await asaasRequest<AsaasCustomer>(
      env,
      `/customers/${customerId}`,
      {},
      { ...ctx, operation: "getCustomer" },
    );
    if (!customer.id || customer.deleted) {
      log?.warn({ userId, customerId }, "Cliente Asaas inválido; pulando recorrência");
      return null;
    }
  } catch (err) {
    if (err instanceof AsaasApiError && err.statusCode === 404) {
      return null;
    }
    throw err;
  }

  const billingType = toAsaasBillingType(user.subscriptionPaymentMethod ?? "PIX");
  if (billingType === "CREDIT_CARD") {
    log?.warn(
      { userId },
      "Assinatura cartão exige dados do cartão — não criar recorrência vazia",
    );
    return user.asaasSubscriptionId;
  }
  const billingAnchor = user.subscribedAt ?? new Date();
  const nextDueDate = nextDueDateOnBillingDay(billingAnchor, new Date());

  const sub = await asaasRequest<AsaasSubscriptionDetail>(
    env,
    "/subscriptions",
    {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType,
        value: SUBSCRIPTION_PRICE,
        cycle: "MONTHLY",
        nextDueDate,
        description: "Motocopiloto — assinatura mensal (recorrência)",
        externalReference: userId,
      }),
    },
    { ...ctx, operation: "createRecurringSubscription" },
  );

  if (!sub.id) {
    throw new Error("Asaas não retornou ID da assinatura recorrente");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { asaasSubscriptionId: sub.id },
  });

  log?.info(
    { userId, subscriptionId: sub.id, nextDueDate, billingAnchor },
    "Assinatura recorrente Asaas garantida após regularização",
  );

  return sub.id;
}
