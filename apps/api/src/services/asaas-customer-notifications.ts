import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "@motoboy/db";
import { asaasRequest, isAsaasConfigured } from "../lib/asaas-client.js";

type AsaasNotificationRow = {
  id: string;
  deleted?: boolean;
};

type AsaasNotificationList = {
  data?: AsaasNotificationRow[];
  hasMore?: boolean;
};

/** Desliga todos os canais (cliente e conta) — evita cobrança por SMS/WhatsApp/ligação. */
export const ASAAS_NOTIFICATION_ALL_OFF = {
  enabled: false,
  emailEnabledForProvider: false,
  smsEnabledForProvider: false,
  emailEnabledForCustomer: false,
  smsEnabledForCustomer: false,
  phoneCallEnabledForCustomer: false,
  whatsappEnabledForCustomer: false,
} as const;

/**
 * Desativa notificações pagas do Asaas para um cliente (flag + lote por evento).
 * @see https://docs.asaas.com/docs/duvidas-frequentes-notificacoes
 */
export async function disableAsaasCustomerNotifications(
  env: Env,
  customerId: string,
  log?: FastifyBaseLogger,
): Promise<{ notificationCount: number }> {
  if (!isAsaasConfigured(env)) {
    return { notificationCount: 0 };
  }

  const id = customerId.trim();
  if (!id) {
    throw Object.assign(new Error("ID do cliente Asaas inválido"), {
      statusCode: 400,
    });
  }

  await asaasRequest(
    env,
    `/customers/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ notificationDisabled: true }),
    },
    { log, operation: "disableCustomerNotificationsFlag" },
  );

  let offset = 0;
  const limit = 100;
  let notificationCount = 0;

  while (true) {
    const listed = await asaasRequest<AsaasNotificationList>(
      env,
      `/customers/${id}/notifications?limit=${limit}&offset=${offset}`,
      {},
      { log, operation: "listCustomerNotifications" },
    );

    const rows = (listed.data ?? []).filter((n) => n.id && !n.deleted);
    if (rows.length === 0) {
      break;
    }

    await asaasRequest(
      env,
      "/notifications/batch",
      {
        method: "POST",
        body: JSON.stringify({
          customer: id,
          notifications: rows.map((row) => ({
            id: row.id,
            ...ASAAS_NOTIFICATION_ALL_OFF,
          })),
        }),
      },
      { log, operation: "disableCustomerNotificationsBatch" },
    );

    notificationCount += rows.length;
    if (!listed.hasMore) break;
    offset += limit;
  }

  log?.info(
    { customerId: id, notificationCount },
    "Notificações Asaas desativadas para o cliente",
  );

  return { notificationCount };
}

export function queueDisableAsaasCustomerNotifications(
  env: Env,
  customerId: string,
  log?: FastifyBaseLogger,
): void {
  void disableAsaasCustomerNotifications(env, customerId, log).catch((err) => {
    log?.warn({ err, customerId }, "Falha ao desativar notificações Asaas (async)");
  });
}

export type DisableAllAsaasNotificationsResult = {
  customersProcessed: number;
  customersFailed: number;
  notificationsUpdated: number;
  errors: Array<{ customerId: string; message: string }>;
};

/** Desativa notificações para uma lista de clientes Asaas (admin / script). */
export async function disableAsaasNotificationsForCustomers(
  env: Env,
  customerIds: string[],
  log?: FastifyBaseLogger,
): Promise<DisableAllAsaasNotificationsResult> {
  const unique = [...new Set(customerIds.map((id) => id.trim()).filter(Boolean))];
  const result: DisableAllAsaasNotificationsResult = {
    customersProcessed: 0,
    customersFailed: 0,
    notificationsUpdated: 0,
    errors: [],
  };

  for (const customerId of unique) {
    try {
      const { notificationCount } = await disableAsaasCustomerNotifications(
        env,
        customerId,
        log,
      );
      result.customersProcessed += 1;
      result.notificationsUpdated += notificationCount;
    } catch (err) {
      result.customersFailed += 1;
      result.errors.push({
        customerId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

type AsaasCustomerListItem = { id?: string };
type AsaasCustomerList = {
  data?: AsaasCustomerListItem[];
  hasMore?: boolean;
};

/** IDs de clientes Asaas vinculados a usuários do app. */
export async function collectAsaasCustomerIdsFromApp(): Promise<string[]> {
  const fromDb = await prisma.user.findMany({
    where: { asaasCustomerId: { not: null } },
    select: { asaasCustomerId: true },
    distinct: ["asaasCustomerId"],
  });
  return fromDb
    .map((row) => row.asaasCustomerId?.trim())
    .filter((id): id is string => Boolean(id));
}

export async function disableAsaasNotificationsForAllAppCustomers(
  env: Env,
  log?: FastifyBaseLogger,
  opts?: { includeAllAsaas?: boolean },
): Promise<DisableAllAsaasNotificationsResult & { customerIds: number }> {
  const all = new Set(await collectAsaasCustomerIdsFromApp());

  if (opts?.includeAllAsaas && isAsaasConfigured(env)) {
    let offset = 0;
    const limit = 100;
    while (true) {
      const listed = await asaasRequest<AsaasCustomerList>(
        env,
        `/customers?limit=${limit}&offset=${offset}`,
        {},
        { log, operation: "listAllAsaasCustomers" },
      );
      for (const row of listed.data ?? []) {
        if (row.id?.trim()) all.add(row.id.trim());
      }
      if (!listed.hasMore) break;
      offset += limit;
    }
  }

  const customerIds = [...all];
  const result = await disableAsaasNotificationsForCustomers(
    env,
    customerIds,
    log,
  );
  return { ...result, customerIds: customerIds.length };
}
