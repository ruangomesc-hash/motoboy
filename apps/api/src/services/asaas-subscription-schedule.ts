import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";
import {
  asaasRequest,
  AsaasApiError,
  isAsaasConfigured,
} from "../lib/asaas-client.js";
import {
  nextDueDateAfterPayment,
  nextDueDateOnBillingDay,
} from "../lib/billing-calendar.js";
import type { AsaasRequestContext } from "../lib/asaas-request-log.js";

export type ScheduleSubscriptionBillingInput = {
  subscriptionId: string;
  paidAt: Date;
  /** Dia do 1º pagamento — ancora cobranças futuras no mesmo dia do mês. */
  subscribedAt: Date | null;
  /** Conta estava inadimplente (PAUSED) ou cobrança paga em atraso. */
  wasOverdue: boolean;
  /** Primeiro pagamento da assinatura (ainda não tinha subscribedAt). */
  isFirstPayment: boolean;
};

/**
 * Atualiza no Asaas o vencimento da próxima mensalidade:
 * - 1º pagamento: próxima cobrança 1 mês após o dia do primeiro pagamento.
 * - Em dia: mantém o dia de cobrança do subscribedAt.
 * - Em atraso: próxima cobrança 1 mês após a data em que o pagamento foi feito.
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
    await asaasRequest(
      env,
      `/subscriptions/${input.subscriptionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          nextDueDate,
          updatePendingPayments,
        }),
      },
      ctx,
    );
    log?.info(
      {
        subscriptionId: input.subscriptionId,
        nextDueDate,
        wasOverdue: input.wasOverdue,
        isFirstPayment: input.isFirstPayment,
      },
      "Próximo vencimento da assinatura agendado no Asaas",
    );
    return nextDueDate;
  } catch (err) {
    if (err instanceof AsaasApiError) {
      log?.warn(
        { err, subscriptionId: input.subscriptionId, nextDueDate },
        "Falha ao agendar próximo vencimento no Asaas",
      );
      return null;
    }
    throw err;
  }
}
