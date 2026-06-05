import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "@motoboy/db";
import {
  asaasBaseUrl,
  asaasRequest,
  AsaasApiError,
  isAsaasConfigured,
  probeAsaasConnection,
  toAsaasBillingType,
} from "../lib/asaas-client.js";
import { SUBSCRIPTION_PRICE } from "./admin-metrics.js";
import {
  processAsaasWebhook,
  type AsaasWebhookPayload,
} from "./asaas-webhook.js";
import { ensureRecurringSubscription } from "./asaas-recurring.js";
import {
  dueDatePlusDays,
  dueDateToday,
  isPaymentSettledAfterDueDate,
} from "../lib/billing-calendar.js";
import {
  reconcileAsaasSubscriptionBilling,
  scheduleNextSubscriptionBilling,
} from "./asaas-subscription-schedule.js";
import {
  ensurePrismaConnection,
  withPrismaRetry,
} from "../lib/prisma-retry.js";
import {
  formatCpfCnpjError,
  isValidCpfCnpj,
  normalizeCpfCnpjDigits,
} from "../lib/cpf-cnpj.js";

const PENDING_CHECKOUT_MAX_AGE_MS = 30 * 60 * 1000;
const FIRST_PAYMENT_POLL_ATTEMPTS = 20;
const FIRST_PAYMENT_POLL_MS = 1000;
/** Poll curto no POST Pix (só ID da cobrança; QR vem no GET /pix-qr). */
const PIX_SUB_PAYMENT_FAST_ATTEMPTS = 6;
const PIX_QR_POLL_MS = 250;
/** Poll longo só em ?wait=1 (fallback). */
const PIX_QR_WAIT_ATTEMPTS = 24;
/** Poll rápido (health / diagnóstico). */
const PIX_QR_QUICK_ATTEMPTS = 3;

const PIX_QR_CACHE_MS = 30 * 60 * 1000;
const pixQrCache = new Map<
  string,
  { payload: string | null; encodedImage: string | null; expires: number }
>();

function getCachedPixQr(chargeId: string): {
  payload: string | null;
  encodedImage: string | null;
} | null {
  const hit = pixQrCache.get(chargeId);
  if (!hit || hit.expires < Date.now()) {
    pixQrCache.delete(chargeId);
    return null;
  }
  return { payload: hit.payload, encodedImage: hit.encodedImage };
}

function setCachedPixQr(
  chargeId: string,
  payload: string | null,
  encodedImage: string | null,
): void {
  if (!payload && !encodedImage) return;
  pixQrCache.set(chargeId, {
    payload,
    encodedImage,
    expires: Date.now() + PIX_QR_CACHE_MS,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PAID_ASAAS_STATUSES = new Set([
  "RECEIVED",
  "CONFIRMED",
  "RECEIVED_IN_CASH",
]);

export function isAsaasHostedInvoiceUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim().toLowerCase();
  return (
    (u.includes("asaas.com") || u.includes("asaas.com.br")) &&
    !u.includes("/assinar")
  );
}

function formatPhoneForAsaas(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length >= 12) return digits;
  if (digits.length === 11) return `55${digits}`;
  return digits;
}

type AsaasCustomer = { id: string; deleted?: boolean; cpfCnpj?: string };
type AsaasCustomerList = { data?: AsaasCustomer[] };
type AsaasPayment = {
  id: string;
  customer?: string;
  externalReference?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  status?: string;
  value?: number;
  billingType?: string;
  subscription?: string;
  dueDate?: string;
};

function isAsaasPaymentPaid(status: string | undefined): boolean {
  return PAID_ASAAS_STATUSES.has((status ?? "").toUpperCase());
}
type AsaasPixQr = { payload?: string; encodedImage?: string };
type AsaasSubscription = {
  id: string;
  billingType?: string;
  status?: string;
  deleted?: boolean;
};

const DEAD_ASAAS_SUBSCRIPTION_STATUSES = new Set(["INACTIVE", "EXPIRED"]);

export type SubscribeCheckoutResult = {
  checkoutUrl: string;
  chargeId: string;
  invoiceUrl: string;
  pixCopyPaste: string | null;
  pixQrCodeImage: string | null;
  amount: number;
  subscriptionId: string;
  cardAuthorized?: boolean;
  activated?: boolean;
  pixPending?: boolean;
};

export type SubscribeCheckoutOptions = {
  cpfCnpj?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
    addressComplement?: string;
  };
  remoteIp?: string;
};

export class AsaasService {
  constructor(
    private env: Env,
    private log?: FastifyBaseLogger,
  ) {}

  private api<T>(
    path: string,
    init: RequestInit = {},
    operation?: string,
  ): Promise<T> {
    return asaasRequest<T>(this.env, path, init, {
      log: this.log,
      operation,
    });
  }

  get configured(): boolean {
    return isAsaasConfigured(this.env);
  }

  connectionStatus(): {
    configured: boolean;
    webhookPath: string;
    webhookTokenConfigured: boolean;
    sandbox: boolean;
    apiBaseUrl: string;
  } {
    return {
      configured: this.configured,
      webhookPath: "/api/backend/webhooks/asaas",
      webhookTokenConfigured: Boolean(this.env.ASAAS_WEBHOOK_TOKEN?.trim()),
      sandbox: Boolean(this.env.ASAAS_SANDBOX),
      apiBaseUrl: asaasBaseUrl(this.env),
    };
  }

  async probeConnection(): Promise<{
    ok: boolean;
    latencyMs: number;
    error?: string;
  }> {
    const probe = await probeAsaasConnection(this.env);
    return {
      ok: probe.ok,
      latencyMs: probe.latencyMs,
      error: probe.error,
    };
  }

  /**
   * Checkout Pix: cria assinatura recorrente no Asaas (POST /subscriptions) e retorna
   * a primeira cobrança; QR via GET /pix-qr (resposta rápida no POST).
   */
  /** Só localiza cobrança pendente — sem buscar QR (resposta rápida). */
  async getPendingPixCheckout(
    userId: string,
  ): Promise<SubscribeCheckoutResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        asaasSubscriptionId: true,
        subscriptionPaymentMethod: true,
        asaasCustomerId: true,
      },
    });

    if (user?.status === "ACTIVE") {
      return null;
    }

    if (user) {
      const fromSubscription = await this.resumePendingCheckout(user, "PIX");
      if (fromSubscription) {
        return {
          checkoutUrl: fromSubscription.checkoutUrl,
          chargeId: fromSubscription.chargeId,
          invoiceUrl: fromSubscription.invoiceUrl,
          pixCopyPaste: null,
          pixQrCodeImage: null,
          amount: fromSubscription.amount,
          subscriptionId: fromSubscription.subscriptionId,
          pixPending: true,
        };
      }
    }

    const fromDb = await this.resumePendingPixFromDb(userId);
    if (fromDb) return fromDb;

    const fromRef = await this.resumePendingPixByUserReference(userId);
    if (fromRef) return fromRef;

    if (!user?.asaasCustomerId) return null;

    return this.resumePendingPixFromAsaas(userId, user.asaasCustomerId);
  }

  /** Pré-aquece cliente Asaas enquanto o usuário preenche o CPF (POST fica mais rápido). */
  async preparePixCustomer(
    userId: string,
    cpfCnpjRaw: string,
    log?: FastifyBaseLogger,
  ): Promise<{ ok: true; customerReady: boolean }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }
    const cpfCnpj = normalizeCpfCnpjDigits(cpfCnpjRaw);
    if (!isValidCpfCnpj(cpfCnpj)) {
      throw Object.assign(new Error(formatCpfCnpjError()), { statusCode: 400 });
    }
    if (!this.configured) {
      return { ok: true, customerReady: true };
    }
    const customerId = await this.ensurePixCustomer(user, cpfCnpj, log);
    return { ok: true, customerReady: Boolean(customerId) };
  }

  async createPixCheckout(
    userId: string,
    cpfCnpjRaw: string,
    log?: FastifyBaseLogger,
  ): Promise<SubscribeCheckoutResult> {
    const routeLog = log ?? this.log;
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    const cpfCnpj = normalizeCpfCnpjDigits(cpfCnpjRaw);
    if (!isValidCpfCnpj(cpfCnpj)) {
      throw Object.assign(new Error(formatCpfCnpjError()), { statusCode: 400 });
    }

    if (!this.configured) {
      const mock = await this.createMockCharge(userId, SUBSCRIPTION_PRICE);
      return {
        checkoutUrl: mock.invoiceUrl,
        chargeId: mock.chargeId,
        invoiceUrl: mock.invoiceUrl,
        pixCopyPaste: mock.pixCopyPaste,
        pixQrCodeImage: mock.pixQrCodeImage,
        amount: mock.amount,
        subscriptionId: `mock_sub_${userId}`,
      };
    }

    if (user.status === "CANCELED") {
      await this.prepareCanceledUserForResubscribe(userId, routeLog);
      user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw Object.assign(new Error("Usuário não encontrado"), {
          statusCode: 404,
        });
      }
    }

    const customerId = await this.ensurePixCustomer(user, cpfCnpj, routeLog);
    const userForCheckout = {
      id: user.id,
      asaasSubscriptionId: user.asaasSubscriptionId,
      subscriptionPaymentMethod: user.subscriptionPaymentMethod ?? "PIX",
    };

    const resumedCheckout = await this.resumePendingCheckout(
      userForCheckout,
      "PIX",
      routeLog,
    );
    if (resumedCheckout) {
      routeLog?.info(
        { userId, chargeId: resumedCheckout.chargeId, subscriptionId: resumedCheckout.subscriptionId },
        "Pix pendente (assinatura Asaas)",
      );
      return {
        ...resumedCheckout,
        pixPending: !(
          resumedCheckout.pixCopyPaste || resumedCheckout.pixQrCodeImage
        ),
      };
    }

    const resumedDb = await this.resumePendingPixFromDb(userId);
    if (resumedDb) {
      routeLog?.info({ userId, chargeId: resumedDb.chargeId }, "Pix pendente (DB)");
      return { ...resumedDb, pixPending: true };
    }

    const resumedRef = await this.resumePendingPixByUserReference(userId);
    if (resumedRef) {
      routeLog?.info(
        { userId, chargeId: resumedRef.chargeId },
        "Pix pendente (cobrança avulsa legada)",
      );
      return { ...resumedRef, pixPending: true };
    }

    const resumedAsaas = await this.resumePendingPixFromAsaas(userId, customerId);
    if (resumedAsaas) {
      routeLog?.info(
        { userId, chargeId: resumedAsaas.chargeId },
        "Pix pendente (Asaas API)",
      );
      return { ...resumedAsaas, pixPending: true };
    }

    await this.markStalePixPaymentsFailed(userId);

    const billingType = "PIX";
    const nextDueDate = dueDateToday();

    let subId = await this.ensureSubscriptionBillingType(
      userId,
      user.asaasSubscriptionId,
      billingType,
      routeLog,
    );

    if (!subId) {
      const sub = await this.api<AsaasSubscription>(
        "/subscriptions",
        {
          method: "POST",
          body: JSON.stringify({
            customer: customerId,
            billingType,
            value: SUBSCRIPTION_PRICE,
            cycle: "MONTHLY",
            nextDueDate,
            description: "Motocopiloto — assinatura mensal",
            externalReference: userId,
          }),
        },
        "createPixSubscription",
      );

      if (!sub.id) {
        throw Object.assign(new Error("Falha ao criar assinatura Pix no Asaas"), {
          statusCode: 502,
          code: "ASAAS_NO_SUBSCRIPTION_ID",
        });
      }
      subId = sub.id;

      try {
        await withPrismaRetry(() =>
          prisma.user.update({
            where: { id: userId },
            data: { asaasSubscriptionId: subId },
          }),
        );
      } catch (err) {
        try {
          await this.api(
            `/subscriptions/${subId}`,
            { method: "DELETE" },
            "rollbackPixSubscription",
          );
        } catch (rollbackErr) {
          routeLog?.error(
            { err: rollbackErr, subId },
            "Falha ao reverter assinatura Pix após erro no banco",
          );
        }
        throw err;
      }
    }

    let first = await this.findFirstOpenSubscriptionPayment(
      subId,
      PIX_SUB_PAYMENT_FAST_ATTEMPTS,
    );

    if (!first?.id) {
      routeLog?.info(
        { userId, subId },
        "Sem cobrança na assinatura Pix — recriando assinatura",
      );
      await this.clearAsaasSubscription(userId, subId, routeLog);
      const sub = await this.api<AsaasSubscription>(
        "/subscriptions",
        {
          method: "POST",
          body: JSON.stringify({
            customer: customerId,
            billingType,
            value: SUBSCRIPTION_PRICE,
            cycle: "MONTHLY",
            nextDueDate,
            description: "Motocopiloto — assinatura mensal",
            externalReference: userId,
          }),
        },
        "recreatePixSubscription",
      );
      if (!sub.id) {
        throw Object.assign(new Error("Falha ao recriar assinatura Pix no Asaas"), {
          statusCode: 502,
          code: "ASAAS_NO_SUBSCRIPTION_ID",
        });
      }
      subId = sub.id;
      await withPrismaRetry(() =>
        prisma.user.update({
          where: { id: userId },
          data: { asaasSubscriptionId: subId },
        }),
      );
      first = await this.findFirstOpenSubscriptionPayment(
        subId,
        PIX_SUB_PAYMENT_FAST_ATTEMPTS,
      );
    }

    if (!first?.id) {
      throw Object.assign(
        new Error(
          "A assinatura foi criada; a cobrança Pix está sendo gerada. Aguarde 3 segundos e tente de novo.",
        ),
        { statusCode: 409, code: "SUBSCRIPTION_CHARGE_PENDING" },
      );
    }

    void this.ensurePendingPaymentRecord(userId, first.id).catch((err) => {
      routeLog?.warn({ err, userId, chargeId: first.id }, "Registro Pix (async)");
    });

    routeLog?.info(
      { userId, subscriptionId: subId, chargeId: first.id },
      "Assinatura Pix criada no Asaas (primeira cobrança)",
    );

    return {
      checkoutUrl: "",
      chargeId: first.id,
      invoiceUrl: "",
      pixCopyPaste: null,
      pixQrCodeImage: null,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId: subId,
      pixPending: true,
    };
  }

  private async isAsaasPaymentPending(chargeId: string): Promise<boolean> {
    try {
      const payment = await this.getPaymentById(chargeId);
      const status = payment.status?.toUpperCase() ?? "";
      return status === "PENDING" || status === "OVERDUE";
    } catch {
      return false;
    }
  }

  /** Busca cobrança Pix pendente pelo externalReference (= userId) no Asaas. */
  private async resumePendingPixByUserReference(
    userId: string,
  ): Promise<SubscribeCheckoutResult | null> {
    if (!this.configured) return null;
    try {
      const listed = await this.api<{ data?: AsaasPayment[] }>(
        `/payments?externalReference=${encodeURIComponent(userId)}&status=PENDING&billingType=PIX&limit=5`,
        {},
        "listPendingPixByUserRef",
      );
      const match = (listed.data ?? []).find((p) => p.id);
      if (!match?.id) return null;

      await this.ensurePendingPaymentRecord(userId, match.id);
      return {
        checkoutUrl: "",
        chargeId: match.id,
        invoiceUrl: "",
        pixCopyPaste: null,
        pixQrCodeImage: null,
        amount: SUBSCRIPTION_PRICE,
        subscriptionId: match.subscription ?? match.id,
        pixPending: true,
      };
    } catch {
      return null;
    }
  }

  /** Reaproveita cobrança Pix pendente no Asaas quando o registro local ainda não existe. */
  private async resumePendingPixFromAsaas(
    userId: string,
    customerId: string,
  ): Promise<SubscribeCheckoutResult | null> {
    if (!this.configured) return null;
    try {
      const listed = await this.api<{ data?: AsaasPayment[] }>(
        `/payments?customer=${encodeURIComponent(customerId)}&status=PENDING&billingType=PIX&limit=10`,
        {},
        "listPendingPixPayments",
      );
      const match = (listed.data ?? []).find(
        (p) => p.externalReference === userId && p.id,
      );
      if (!match?.id) return null;

      await this.ensurePendingPaymentRecord(userId, match.id);
      return {
        checkoutUrl: "",
        chargeId: match.id,
        invoiceUrl: "",
        pixCopyPaste: null,
        pixQrCodeImage: null,
        amount: SUBSCRIPTION_PRICE,
        subscriptionId: match.subscription ?? match.id,
        pixPending: true,
      };
    } catch {
      return null;
    }
  }

  private async verifyUserOwnsAsaasCharge(
    userId: string,
    chargeId: string,
  ): Promise<boolean> {
    if (!this.configured) return true;
    try {
      const payment = await this.getPaymentById(chargeId);
      if (payment.externalReference === userId) return true;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { asaasCustomerId: true },
      });
      return Boolean(
        user?.asaasCustomerId && payment.customer === user.asaasCustomerId,
      );
    } catch {
      return false;
    }
  }

  private async resumePendingPixFromDb(
    userId: string,
  ): Promise<SubscribeCheckoutResult | null> {
    const since = new Date(Date.now() - PENDING_CHECKOUT_MAX_AGE_MS);
    const pending = await prisma.payment.findFirst({
      where: {
        userId,
        chargeKind: "SUBSCRIPTION",
        createdAt: { gte: since },
        asaasChargeId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!pending?.asaasChargeId) return null;

    if (pending.status !== "PENDING") {
      if (!(await this.isAsaasPaymentPending(pending.asaasChargeId))) {
        return null;
      }
      void withPrismaRetry(() =>
        prisma.payment.update({
          where: { id: pending.id },
          data: { status: "PENDING" },
        }),
      ).catch(() => {
        /* segue com cobrança válida no Asaas */
      });
    }

    let subscriptionId: string | null = null;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { asaasSubscriptionId: true },
    });
    subscriptionId = user?.asaasSubscriptionId ?? null;

    if (!subscriptionId && this.configured) {
      try {
        const remote = await this.getPaymentById(pending.asaasChargeId);
        subscriptionId = remote.subscription ?? null;
      } catch {
        /* usa fallback abaixo */
      }
    }

    return {
      checkoutUrl: "",
      chargeId: pending.asaasChargeId,
      invoiceUrl: "",
      pixCopyPaste: null,
      pixQrCodeImage: null,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId: subscriptionId ?? pending.asaasChargeId,
      pixPending: true,
    };
  }

  private async ensurePixCustomer(
    user: {
      id: string;
      name: string | null;
      email: string | null;
      whatsappNumber: string;
      asaasCustomerId: string | null;
      cpfCnpj: string | null;
    },
    cpfCnpj: string,
    log?: FastifyBaseLogger,
  ): Promise<string> {
    if (user.asaasCustomerId) {
      if (user.cpfCnpj !== cpfCnpj) {
        await withPrismaRetry(() =>
          prisma.user.update({
            where: { id: user.id },
            data: { cpfCnpj },
          }),
        );
        void this.api(
          `/customers/${user.asaasCustomerId}`,
          {
            method: "PUT",
            body: JSON.stringify({ cpfCnpj }),
          },
          "updateCustomerCpfAsync",
        ).catch((err) => {
          log?.warn({ err, userId: user.id }, "Atualização CPF Asaas (async)");
        });
      }
      return user.asaasCustomerId;
    }

    const listed = await this.api<AsaasCustomerList>(
      `/customers?externalReference=${encodeURIComponent(user.id)}&limit=1`,
      {},
      "listCustomersByReferencePix",
    );
    const found = listed.data?.[0];
    if (found?.id) {
      await withPrismaRetry(() =>
        prisma.user.update({
          where: { id: user.id },
          data: { asaasCustomerId: found.id, cpfCnpj },
        }),
      );
      return found.id;
    }

    const created = await this.api<AsaasCustomer>(
      "/customers",
      {
        method: "POST",
        body: JSON.stringify({
          name: user.name?.trim() || "Motoboy Motocopiloto",
          email: user.email ?? undefined,
          mobilePhone: formatPhoneForAsaas(user.whatsappNumber),
          cpfCnpj,
          externalReference: user.id,
          notificationDisabled: false,
        }),
      },
      "createCustomerPix",
    );

    if (!created.id) {
      throw new Error("Asaas não retornou ID do cliente");
    }

    await withPrismaRetry(() =>
      prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId: created.id, cpfCnpj },
      }),
    );

    return created.id;
  }

  private async createAsaasPixPayment(
    customerId: string,
    userId: string,
  ): Promise<AsaasPayment> {
    return this.api<AsaasPayment>(
      "/payments",
      {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType: "PIX",
          value: SUBSCRIPTION_PRICE,
          dueDate: dueDatePlusDays(0),
          description: "Motocopiloto — assinatura mensal",
          externalReference: userId,
        }),
      },
      "createPixSubscriptionPayment",
    );
  }

  private async markStalePixPaymentsFailed(userId: string): Promise<void> {
    await withPrismaRetry(() =>
      prisma.payment.updateMany({
        where: {
          userId,
          chargeKind: "SUBSCRIPTION",
          status: "PENDING",
        },
        data: { status: "FAILED" },
      }),
    );
  }

  async syncCustomerCpf(
    user: {
      id: string;
      name: string | null;
      email: string | null;
      whatsappNumber: string;
      asaasCustomerId: string | null;
      cpfCnpj: string | null;
    },
    cpfCnpjRaw: string,
  ): Promise<string> {
    const cpfCnpj = normalizeCpfCnpjDigits(cpfCnpjRaw);
    if (!isValidCpfCnpj(cpfCnpj)) {
      throw Object.assign(new Error(formatCpfCnpjError()), { statusCode: 400 });
    }

    const customerId = await this.getOrCreateCustomer(user, cpfCnpj);

    if (user.cpfCnpj !== cpfCnpj) {
      await withPrismaRetry(() =>
        prisma.user.update({
          where: { id: user.id },
          data: { cpfCnpj },
        }),
      );
    }

    if (this.configured) {
      await this.api(
        `/customers/${customerId}`,
        {
          method: "PUT",
          body: JSON.stringify({ cpfCnpj }),
        },
        "updateCustomerCpf",
      );
    }

    return customerId;
  }

  async getOrCreateCustomer(
    user: {
      id: string;
      name: string | null;
      email: string | null;
      whatsappNumber: string;
      asaasCustomerId: string | null;
      cpfCnpj?: string | null;
    },
    cpfCnpj?: string | null,
  ): Promise<string> {
    if (!this.configured) {
      return `mock_cus_${user.id}`;
    }

    if (user.asaasCustomerId) {
      try {
        const existing = await this.api<AsaasCustomer>(
          `/customers/${user.asaasCustomerId}`,
          {},
          "getCustomer",
        );
        if (existing.id && !existing.deleted) {
          return existing.id;
        }
      } catch (err) {
        if (!(err instanceof AsaasApiError) || err.statusCode !== 404) {
          throw err;
        }
      }
    }

    const listed = await this.api<AsaasCustomerList>(
      `/customers?externalReference=${encodeURIComponent(user.id)}&limit=1`,
      {},
      "listCustomersByReference",
    );
    const found = listed.data?.[0];
    if (found?.id) {
      await withPrismaRetry(() =>
        prisma.user.update({
          where: { id: user.id },
          data: { asaasCustomerId: found.id },
        }),
      );
      return found.id;
    }

    const cpfDigits = cpfCnpj
      ? normalizeCpfCnpjDigits(cpfCnpj)
      : user.cpfCnpj
        ? normalizeCpfCnpjDigits(user.cpfCnpj)
        : null;

    const created = await this.api<AsaasCustomer>(
      "/customers",
      {
        method: "POST",
        body: JSON.stringify({
          name: user.name?.trim() || "Motoboy Motocopiloto",
          email: user.email ?? undefined,
          mobilePhone: formatPhoneForAsaas(user.whatsappNumber),
          externalReference: user.id,
          notificationDisabled: false,
          ...(cpfDigits ? { cpfCnpj: cpfDigits } : {}),
        }),
      },
      "createCustomer",
    );

    if (!created.id) {
      throw new Error("Asaas não retornou ID do cliente");
    }

    await withPrismaRetry(() =>
      prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId: created.id },
      }),
    );

    return created.id;
  }

  /**
   * Cobrança avulsa — apenas suporte/admin (regularização de Pix).
   * Após o pagamento, `ensureRecurringSubscription` liga a recorrência mensal no Asaas.
   */
  async createSupportPaymentCharge(
    userId: string,
    paymentMethod: string = "PIX",
  ): Promise<{
    paymentId: string;
    invoiceUrl: string;
    pixCopyPaste: string | null;
    pixQrCodeImage: string | null;
    chargeId: string;
    amount: number;
  }> {
    const amount = SUBSCRIPTION_PRICE;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    if (!this.configured) {
      return this.createMockCharge(userId, amount);
    }

    const customerId = await this.getOrCreateCustomer(user);
    const billingType = toAsaasBillingType(paymentMethod);

    this.log?.info(
      { userId, paymentMethod },
      "Admin: criando cobrança avulsa de regularização",
    );

    const payment = await this.api<AsaasPayment>(
      "/payments",
      {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType,
          value: amount,
          dueDate: dueDatePlusDays(3),
          description: "Motocopiloto — regularização suporte",
          externalReference: userId,
        }),
      },
      "createSupportPayment",
    );

    if (!payment.id) {
      throw new Error("Falha ao criar cobrança no Asaas");
    }

    const pix = await this.fetchPixQrWithAttempts(
      payment.id,
      PIX_QR_QUICK_ATTEMPTS,
    );
    if (!pix.payload && !pix.encodedImage) {
      throw Object.assign(
        new Error("Asaas ainda não liberou o QR Pix desta cobrança."),
        { statusCode: 502, code: "PIX_QR_EMPTY" },
      );
    }

    const invoiceUrl =
      payment.invoiceUrl ??
      payment.bankSlipUrl ??
      `${this.env.APP_URL}/assinar?charge=${payment.id}`;

    await prisma.payment.create({
      data: {
        userId,
        asaasChargeId: payment.id,
        status: "PENDING",
        amount,
        chargeKind: "SUPPORT",
      },
    });

    return {
      paymentId: payment.id,
      invoiceUrl,
      pixCopyPaste: pix.payload,
      pixQrCodeImage: pix.encodedImage,
      chargeId: payment.id,
      amount,
    };
  }

  /** @deprecated Use `createSupportPaymentCharge` (admin). */
  async createPaymentCharge(
    userId: string,
    paymentMethod: string = "PIX",
  ) {
    return this.createSupportPaymentCharge(userId, paymentMethod);
  }

  /** Assinatura recorrente mensal no Asaas + primeira cobrança (fluxo motoboy em /assinar). */
  async createSubscription(
    userId: string,
    paymentMethod: string = "PIX",
    log?: FastifyBaseLogger,
    options?: SubscribeCheckoutOptions,
  ): Promise<SubscribeCheckoutResult> {
    const routeLog = log ?? this.log;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    const cpfRaw =
      options?.cpfCnpj ??
      options?.creditCardHolderInfo?.cpfCnpj ??
      user.cpfCnpj ??
      "";
    const billingType = toAsaasBillingType(paymentMethod);
    const inlineCard =
      billingType === "CREDIT_CARD" &&
      options?.creditCard &&
      options?.creditCardHolderInfo;

    if (!cpfRaw.trim()) {
      throw Object.assign(
        new Error("Informe seu CPF para gerar a cobrança."),
        { statusCode: 400 },
      );
    }

    if (billingType === "CREDIT_CARD" && !inlineCard) {
      throw Object.assign(
        new Error("Preencha os dados do cartão para continuar."),
        { statusCode: 400 },
      );
    }

    if (!this.configured) {
      const mock = await this.createMockCharge(userId, SUBSCRIPTION_PRICE);
      return {
        checkoutUrl: mock.invoiceUrl,
        chargeId: mock.chargeId,
        invoiceUrl: mock.invoiceUrl,
        pixCopyPaste: mock.pixCopyPaste,
        pixQrCodeImage: mock.pixQrCodeImage,
        amount: mock.amount,
        subscriptionId: `mock_sub_${userId}`,
      };
    }

    if (billingType === "PIX") {
      return this.createPixCheckout(userId, cpfRaw, routeLog);
    }

    const customerId = await this.syncCustomerCpf(user, cpfRaw);

    const userFresh = await prisma.user.findUnique({ where: { id: userId } });
    if (!userFresh) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    const forceFreshCheckout = userFresh.status === "CANCELED";
    if (forceFreshCheckout) {
      await this.prepareCanceledUserForResubscribe(userFresh.id, routeLog);
    }

    const userForCheckout = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userForCheckout) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    const resumed = forceFreshCheckout
      ? null
      : await this.resumePendingCheckout(
          userForCheckout,
          paymentMethod,
          routeLog,
        );
    if (resumed) return resumed;

    const cardCustomerId = await this.getOrCreateCustomer(
      userForCheckout,
      userForCheckout.cpfCnpj,
    );

    const nextDueDate = dueDateToday();

    let subId = userForCheckout.asaasSubscriptionId;
    subId = await this.ensureSubscriptionBillingType(
      userId,
      subId,
      billingType,
      routeLog,
    );

    if (inlineCard) {
      if (subId) {
        await this.clearAsaasSubscription(userId, subId, routeLog);
        subId = null;
      }
      return this.createSubscriptionWithCreditCard(
        cardCustomerId,
        userId,
        nextDueDate,
        options!,
        routeLog,
      );
    }

    if (!subId) {
      const sub = await this.api<AsaasSubscription>(
        "/subscriptions",
        {
          method: "POST",
          body: JSON.stringify({
            customer: cardCustomerId,
            billingType,
            value: SUBSCRIPTION_PRICE,
            cycle: "MONTHLY",
            nextDueDate,
            description: "Motocopiloto — assinatura mensal",
            externalReference: userId,
          }),
        },
        "createSubscription",
      );

      if (!sub.id) {
        throw new Error("Falha ao criar assinatura no Asaas");
      }
      subId = sub.id;

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { asaasSubscriptionId: subId },
        });
      } catch (err) {
        try {
          await this.api(
            `/subscriptions/${subId}`,
            { method: "DELETE" },
            "rollbackSubscription",
          );
        } catch (rollbackErr) {
          routeLog?.error(
            { err: rollbackErr, subId },
            "Falha ao reverter assinatura Asaas após erro no banco",
          );
        }
        throw err;
      }
    }

    let first = await this.waitForFirstSubscriptionPayment(
      subId,
      billingType,
      routeLog,
    );

    if (!first?.id && subId) {
      routeLog?.info(
        { userId, subId },
        "Sem cobrança na assinatura — recriando assinatura Pix",
      );
      await this.clearAsaasSubscription(userId, subId, routeLog);
      const sub = await this.api<AsaasSubscription>(
        "/subscriptions",
        {
          method: "POST",
          body: JSON.stringify({
            customer: cardCustomerId,
            billingType,
            value: SUBSCRIPTION_PRICE,
            cycle: "MONTHLY",
            nextDueDate,
            description: "Motocopiloto — assinatura mensal",
            externalReference: userId,
          }),
        },
        "recreateSubscriptionPix",
      );
      if (!sub.id) {
        throw new Error("Falha ao recriar assinatura no Asaas");
      }
      subId = sub.id;
      await prisma.user.update({
        where: { id: userId },
        data: { asaasSubscriptionId: subId },
      });
      first = await this.waitForFirstSubscriptionPayment(
        subId,
        billingType,
        routeLog,
      );
    }

    const chargeId = first?.id ?? subId;
    const resolved = await this.buildCheckoutFromPayment(
      first,
      chargeId,
      billingType,
      userId,
      subId,
    );

    this.assertCheckoutReady(resolved, billingType, false);
    return resolved;
  }

  /** Após cancelamento: descarta cobranças pendentes e vínculo Asaas antigo. */
  private async prepareCanceledUserForResubscribe(
    userId: string,
    log?: FastifyBaseLogger,
  ): Promise<void> {
    await prisma.payment.updateMany({
      where: {
        userId,
        chargeKind: "SUBSCRIPTION",
        status: "PENDING",
      },
      data: { status: "FAILED" },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.asaasSubscriptionId) {
      await this.clearAsaasSubscription(
        userId,
        user.asaasSubscriptionId,
        log,
      );
    }

    log?.info({ userId }, "Checkout preparado para reassinatura (conta cancelada)");
  }

  private async clearAsaasSubscription(
    userId: string,
    subId: string | null | undefined,
    log?: FastifyBaseLogger,
  ): Promise<void> {
    if (subId && this.configured) {
      try {
        await this.api(
          `/subscriptions/${subId}`,
          { method: "DELETE" },
          "clearAsaasSubscription",
        );
      } catch (err) {
        if (!(err instanceof AsaasApiError) || err.statusCode !== 404) {
          log?.warn({ err, subId, userId }, "Falha ao remover assinatura Asaas");
        }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { asaasSubscriptionId: null },
    });
  }

  private async createSubscriptionWithCreditCard(
    customerId: string,
    userId: string,
    nextDueDate: string,
    options: SubscribeCheckoutOptions,
    log?: FastifyBaseLogger,
  ): Promise<SubscribeCheckoutResult> {
    const remoteIp = options.remoteIp?.trim() || "127.0.0.1";
    const holder = options.creditCardHolderInfo!;
    const card = options.creditCard!;

    const sub = await this.api<AsaasSubscription>(
      "/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType: "CREDIT_CARD",
          value: SUBSCRIPTION_PRICE,
          cycle: "MONTHLY",
          nextDueDate,
          description: "Motocopiloto — assinatura mensal",
          externalReference: userId,
          creditCard: {
            holderName: card.holderName,
            number: card.number,
            expiryMonth: card.expiryMonth,
            expiryYear: card.expiryYear,
            ccv: card.ccv,
          },
          creditCardHolderInfo: {
            name: holder.name,
            email: holder.email,
            cpfCnpj: holder.cpfCnpj,
            postalCode: holder.postalCode,
            addressNumber: holder.addressNumber,
            phone: holder.phone,
            mobilePhone: holder.phone,
            ...(holder.addressComplement
              ? { addressComplement: holder.addressComplement }
              : {}),
          },
          remoteIp,
        }),
      },
      "createSubscriptionWithCreditCard",
    );

    if (!sub.id) {
      throw new Error("Falha ao validar cartão no Asaas");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { asaasSubscriptionId: sub.id },
    });

    log?.info({ userId, subId: sub.id }, "Assinatura criada com cartão (inline)");

    const sync = await this.syncSubscriptionPaymentStatus(userId, log);

    const first = await this.waitForFirstSubscriptionPayment(
      sub.id,
      "CREDIT_CARD",
      log,
      4,
    );
    if (first?.id) {
      await this.ensurePendingPaymentRecord(userId, first.id);
    }

    return {
      checkoutUrl: "",
      chargeId: first?.id ?? sub.id,
      invoiceUrl: "",
      pixCopyPaste: null,
      pixQrCodeImage: null,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId: sub.id,
      cardAuthorized: true,
      activated: sync.activated,
    };
  }

  private async activateUserFromPaidCharge(
    userId: string,
    user: {
      status: string;
      subscribedAt: Date | null;
      asaasSubscriptionId: string | null;
    },
    chargeId: string,
    remote: AsaasPayment,
    log?: FastifyBaseLogger,
  ): Promise<boolean> {
    if (!isAsaasPaymentPaid(remote.status)) {
      return false;
    }

    const paidAt = new Date();
    const isFirstPayment = !user.subscribedAt;
    const wasOverdue =
      user.status === "PAUSED" ||
      isPaymentSettledAfterDueDate(paidAt, remote.dueDate);
    const subscribedAtAfter = user.subscribedAt ?? paidAt;

    await withPrismaRetry(() =>
      prisma.payment.updateMany({
        where: { userId, asaasChargeId: chargeId },
        data: { status: "PAID", paidAt },
      }),
    );
    const linkedSubscriptionId =
      remote.subscription?.trim() || user.asaasSubscriptionId || null;

    await withPrismaRetry(() =>
      prisma.user.update({
        where: { id: userId },
        data: {
          status: "ACTIVE",
          subscribedAt: subscribedAtAfter,
          trialEndsAt: null,
          subscriptionPaymentMethod:
            remote.billingType === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX",
          ...(linkedSubscriptionId
            ? { asaasSubscriptionId: linkedSubscriptionId }
            : {}),
        },
      }),
    );

    if (!linkedSubscriptionId) {
      void ensureRecurringSubscription(this.env, userId, log).catch((err) => {
        log?.error(
          { err, userId, chargeId },
          "Pagamento confirmado via sync, mas falha ao garantir recorrência",
        );
      });
    } else {
      try {
        await scheduleNextSubscriptionBilling(
          this.env,
          {
            subscriptionId: linkedSubscriptionId,
            paidAt,
            subscribedAt: subscribedAtAfter,
            wasOverdue,
            isFirstPayment,
          },
          log,
        );
      } catch (err) {
        log?.warn(
          { err, userId, chargeId, subscriptionId: linkedSubscriptionId },
          "Pagamento confirmado, mas falha ao gravar próximo vencimento no Asaas",
        );
      }
      log?.info(
        { userId, chargeId, subscriptionId: linkedSubscriptionId },
        "Assinatura Asaas vinculada ao pagamento confirmado",
      );
    }

    log?.info({ userId, chargeId }, "Assinatura ativada via sync (Asaas)");
    return true;
  }

  private async findPaidPixChargeOnAsaas(
    userId: string,
  ): Promise<AsaasPayment | null> {
    if (!this.configured) return null;
    try {
      const listed = await this.api<{ data?: AsaasPayment[] }>(
        `/payments?externalReference=${encodeURIComponent(userId)}&limit=15`,
        {},
        "listPaymentsByUserRef",
      );
      return (
        (listed.data ?? []).find(
          (p) => p.id && isAsaasPaymentPaid(p.status),
        ) ?? null
      );
    } catch {
      return null;
    }
  }

  /**
   * Consulta cobrança no Asaas (fallback se o webhook atrasar).
   */
  private deferActiveUserAsaasSync(
    userId: string,
    user: {
      asaasSubscriptionId: string | null;
      cpfCnpj: string | null;
      asaasCustomerId: string | null;
    },
    log?: FastifyBaseLogger,
  ): void {
    if (!this.configured) return;

    void (async () => {
      if (!user.asaasSubscriptionId) {
        try {
          await ensureRecurringSubscription(this.env, userId, log);
        } catch (err) {
          log?.warn(
            { err, userId },
            "Conta ativa sem assinatura Asaas — falha ao garantir recorrência",
          );
        }
      }
      try {
        await reconcileAsaasSubscriptionBilling(this.env, userId, log);
      } catch (err) {
        log?.warn(
          { err, userId },
          "Falha ao sincronizar próximo vencimento no Asaas",
        );
      }
      if (!user.cpfCnpj && user.asaasCustomerId) {
        try {
          const customer = await this.api<AsaasCustomer>(
            `/customers/${user.asaasCustomerId}`,
            {},
            "syncCustomerCpfFromAsaas",
          );
          const cpf = customer.cpfCnpj
            ? normalizeCpfCnpjDigits(customer.cpfCnpj)
            : "";
          if (cpf && isValidCpfCnpj(cpf)) {
            await withPrismaRetry(() =>
              prisma.user.update({
                where: { id: userId },
                data: { cpfCnpj: cpf },
              }),
            );
          }
        } catch (err) {
          log?.warn({ err, userId }, "Falha ao sincronizar CPF do Asaas");
        }
      }
    })();
  }

  async syncSubscriptionPaymentStatus(
    userId: string,
    log?: FastifyBaseLogger,
    focusChargeId?: string,
  ): Promise<{ status: string; activated: boolean }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    if (user.status === "ACTIVE") {
      this.deferActiveUserAsaasSync(userId, user, log);
      return { status: user.status, activated: false };
    }

    if (!this.configured) {
      return { status: user.status, activated: false };
    }

    const focusId = focusChargeId?.trim();
    if (focusId) {
      try {
        const remote = await this.getPaymentById(focusId);
        const activated = await this.activateUserFromPaidCharge(
          userId,
          user,
          focusId,
          remote,
          log,
        );
        if (activated) {
          return { status: "ACTIVE", activated: true };
        }
      } catch (err) {
        log?.warn({ err, userId, chargeId: focusId }, "Sync cobrança focada");
      }

      const fresh = await prisma.user.findUnique({
        where: { id: userId },
        select: { status: true },
      });
      if (fresh?.status === "ACTIVE") {
        return { status: "ACTIVE", activated: true };
      }
      return { status: user.status, activated: false };
    }

    const since = new Date(Date.now() - PENDING_CHECKOUT_MAX_AGE_MS);
    const candidates = await prisma.payment.findMany({
      where: {
        userId,
        chargeKind: "SUBSCRIPTION",
        asaasChargeId: { not: null },
        createdAt: { gte: since },
        status: { in: ["PENDING", "FAILED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    for (const row of candidates) {
      if (!row.asaasChargeId) continue;
      try {
        const remote = await this.getPaymentById(row.asaasChargeId);
        const activated = await this.activateUserFromPaidCharge(
          userId,
          user,
          row.asaasChargeId,
          remote,
          log,
        );
        if (activated) {
          return { status: "ACTIVE", activated: true };
        }
      } catch (err) {
        log?.warn(
          { err, userId, chargeId: row.asaasChargeId },
          "Sync cobrança local",
        );
      }
    }

    const paidRemote = await this.findPaidPixChargeOnAsaas(userId);
    if (paidRemote?.id) {
      await this.ensurePendingPaymentRecord(userId, paidRemote.id).catch(
        () => {
          /* registro auxiliar */
        },
      );
      const activated = await this.activateUserFromPaidCharge(
        userId,
        user,
        paidRemote.id,
        paidRemote,
        log,
      );
      if (activated) {
        return { status: "ACTIVE", activated: true };
      }
    }

    const refreshed = await prisma.user.findUnique({ where: { id: userId } });
    return { status: refreshed?.status ?? user.status, activated: false };
  }

  private assertCheckoutReady(
    resolved: SubscribeCheckoutResult,
    billingType: string,
    allowCardWithoutInvoice: boolean,
  ): void {
    if (
      billingType === "CREDIT_CARD" &&
      !allowCardWithoutInvoice &&
      !resolved.cardAuthorized &&
      !isAsaasHostedInvoiceUrl(resolved.invoiceUrl)
    ) {
      throw Object.assign(
        new Error(
          "Não foi possível abrir o checkout do cartão. Tente novamente em instantes.",
        ),
        { statusCode: 502 },
      );
    }

    if (
      billingType === "PIX" &&
      !resolved.pixPending &&
      !resolved.pixCopyPaste &&
      !resolved.pixQrCodeImage
    ) {
      throw Object.assign(
        new Error(
          "Não foi possível gerar o QR Pix. Aguarde alguns segundos e tente novamente.",
        ),
        { statusCode: 502, code: "PIX_QR_UNAVAILABLE" },
      );
    }
  }

  /** Lista a primeira cobrança aberta da assinatura sem buscar QR (checkout Pix rápido). */
  private async findFirstOpenSubscriptionPayment(
    subId: string,
    maxAttempts = PIX_SUB_PAYMENT_FAST_ATTEMPTS,
  ): Promise<AsaasPayment | undefined> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const payments = await this.api<{ data?: AsaasPayment[] }>(
        `/subscriptions/${subId}/payments?limit=5`,
        {},
        "listSubscriptionPaymentsFast",
      );
      const candidates = payments.data ?? [];
      const open = candidates.find(
        (p) =>
          p.status === "PENDING" ||
          p.status === "OVERDUE" ||
          p.status === "AWAITING_RISK_ANALYSIS" ||
          !p.status,
      );
      if (open?.id) return open;
      if (candidates[0]?.id) return candidates[0];

      if (attempt < maxAttempts - 1) {
        await sleep(FIRST_PAYMENT_POLL_MS);
      }
    }
    return undefined;
  }

  private async waitForFirstSubscriptionPayment(
    subId: string,
    billingType: string,
    log?: FastifyBaseLogger,
    maxAttempts = FIRST_PAYMENT_POLL_ATTEMPTS,
  ): Promise<AsaasPayment | undefined> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const payments = await this.api<{ data?: AsaasPayment[] }>(
        `/subscriptions/${subId}/payments?limit=5`,
        {},
        "listSubscriptionPayments",
      );
      const candidates = payments.data ?? [];
      const open = candidates.find(
        (p) =>
          p.status === "PENDING" ||
          p.status === "OVERDUE" ||
          p.status === "AWAITING_RISK_ANALYSIS" ||
          !p.status,
      );
      const first = open ?? candidates[0];

      if (first?.id) {
        if (billingType === "PIX") {
          const pix = await this.fetchPixQr(first.id, billingType, false);
          if (pix.payload || pix.encodedImage) return first;
        } else if (billingType === "CREDIT_CARD") {
          try {
            const full = await this.getPaymentById(first.id);
            if (isAsaasHostedInvoiceUrl(full.invoiceUrl ?? full.bankSlipUrl)) {
              return full;
            }
          } catch {
            /* retry */
          }
        } else {
          return first;
        }
      }

      if (attempt < maxAttempts - 1) {
        await sleep(FIRST_PAYMENT_POLL_MS);
      }
    }

    log?.warn({ subId, billingType }, "Primeira cobrança da assinatura ainda não disponível");
    return undefined;
  }

  private async getPaymentById(paymentId: string): Promise<AsaasPayment> {
    return this.api<AsaasPayment>(
      `/payments/${paymentId}`,
      {},
      "getPayment",
    );
  }

  private async resolvePaymentInvoiceUrl(
    payment: AsaasPayment | undefined,
    chargeId: string,
  ): Promise<string> {
    const fromList =
      payment?.invoiceUrl ??
      payment?.bankSlipUrl ??
      null;
    if (isAsaasHostedInvoiceUrl(fromList)) return fromList!;

    if (payment?.id || chargeId) {
      try {
        const full = await this.getPaymentById(payment?.id ?? chargeId);
        const url = full.invoiceUrl ?? full.bankSlipUrl ?? null;
        if (isAsaasHostedInvoiceUrl(url)) return url!;
      } catch {
        /* tenta fallback abaixo */
      }
    }

    return `${this.env.APP_URL}/assinar?charge=${payment?.id ?? chargeId}`;
  }

  /** Pix na assinatura: cobrança avulsa imediata (QR na hora); recorrência via webhook. */
  private async createPixSubscriptionDirectCheckout(
    userId: string,
    customerId: string,
  ): Promise<SubscribeCheckoutResult> {
    const payment = await this.api<AsaasPayment>(
      "/payments",
      {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType: "PIX",
          value: SUBSCRIPTION_PRICE,
          dueDate: dueDatePlusDays(0),
          description: "Motocopiloto — assinatura mensal",
          externalReference: userId,
        }),
      },
      "createPixSubscriptionPayment",
    );

    if (!payment.id) {
      throw Object.assign(new Error("Asaas não retornou ID da cobrança Pix."), {
        statusCode: 502,
        code: "ASAAS_NO_PAYMENT_ID",
      });
    }

    await this.ensurePendingPaymentRecord(userId, payment.id);
    const pix = await this.fetchPixQrWithAttempts(
      payment.id,
      PIX_QR_QUICK_ATTEMPTS,
    );
    const hasQr = Boolean(pix.payload || pix.encodedImage);

    return {
      checkoutUrl: "",
      chargeId: payment.id,
      invoiceUrl: "",
      pixCopyPaste: pix.payload,
      pixQrCodeImage: pix.encodedImage,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId: payment.id,
      pixPending: !hasQr,
    };
  }

  /** Busca QR Pix de cobrança pendente do usuário. Com `wait`, faz poll no servidor. */
  async fetchPixQrForUserCharge(
    userId: string,
    chargeId: string,
    opts?: { wait?: boolean },
  ): Promise<{ pixCopyPaste: string | null; pixQrCodeImage: string | null } | null> {
    const pending = await prisma.payment.findFirst({
      where: {
        userId,
        asaasChargeId: chargeId,
        chargeKind: "SUBSCRIPTION",
      },
    });
    if (!pending) {
      const ownsCharge = await this.verifyUserOwnsAsaasCharge(userId, chargeId);
      if (!ownsCharge) {
        throw Object.assign(
          new Error("Cobrança Pix não encontrada ou já finalizada."),
          { statusCode: 404 },
        );
      }
      await this.ensurePendingPaymentRecord(userId, chargeId).catch(() => {
        /* registro local pode falhar sem impedir leitura do QR */
      });
    } else if (pending.status !== "PENDING") {
      if (!(await this.isAsaasPaymentPending(chargeId))) {
        throw Object.assign(
          new Error("Cobrança Pix não encontrada ou já finalizada."),
          { statusCode: 404 },
        );
      }
    }

    const cached = getCachedPixQr(chargeId);
    if (cached && (cached.payload || cached.encodedImage)) {
      return {
        pixCopyPaste: cached.payload,
        pixQrCodeImage: cached.encodedImage,
      };
    }

    const attempts = opts?.wait ? PIX_QR_WAIT_ATTEMPTS : 1;
    const pix = await this.fetchPixQrWithAttempts(chargeId, attempts);
    if (!pix.payload && !pix.encodedImage) {
      return null;
    }
    setCachedPixQr(chargeId, pix.payload, pix.encodedImage);
    return {
      pixCopyPaste: pix.payload,
      pixQrCodeImage: pix.encodedImage,
    };
  }

  /** Limpa checkout Pix anterior que não gerou QR (evita cobrança/subscription órfã). */
  private async resetPixCheckoutState(
    userId: string,
    log?: FastifyBaseLogger,
  ): Promise<void> {
    await withPrismaRetry(() =>
      prisma.payment.updateMany({
        where: {
          userId,
          chargeKind: "SUBSCRIPTION",
          status: "PENDING",
        },
        data: { status: "FAILED" },
      }),
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const staleSubId = user?.asaasSubscriptionId;
    if (staleSubId) {
      void this.clearAsaasSubscription(userId, staleSubId, log).catch((err) => {
        log?.warn(
          { err, userId, subscriptionId: staleSubId },
          "Limpeza assíncrona de assinatura Asaas (Pix direto)",
        );
      });
    }
  }

  private async buildCheckoutFromPayment(
    payment: AsaasPayment | undefined,
    chargeId: string,
    billingType: string,
    userId: string,
    subscriptionId: string,
  ): Promise<SubscribeCheckoutResult> {
    const pix =
      payment?.id && billingType === "PIX"
        ? await this.fetchPixQrWithAttempts(payment.id, PIX_QR_QUICK_ATTEMPTS)
        : { payload: null, encodedImage: null };

    const invoiceUrl =
      billingType === "PIX"
        ? ""
        : await this.resolvePaymentInvoiceUrl(payment, chargeId);

    if (payment?.id) {
      await this.ensurePendingPaymentRecord(userId, payment.id);
    }

    return {
      checkoutUrl: invoiceUrl,
      chargeId: payment?.id ?? chargeId,
      invoiceUrl,
      pixCopyPaste: pix.payload,
      pixQrCodeImage: pix.encodedImage,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId,
    };
  }

  /** Recria assinatura se o tipo de cobrança (Pix vs cartão) não bate com o pedido atual. */
  private async ensureSubscriptionBillingType(
    userId: string,
    subId: string | null,
    billingType: string,
    log?: FastifyBaseLogger,
  ): Promise<string | null> {
    if (!subId) return null;

    try {
      const sub = await this.api<AsaasSubscription>(
        `/subscriptions/${subId}`,
        {},
        "getSubscription",
      );
      const isDead =
        sub.deleted === true ||
        DEAD_ASAAS_SUBSCRIPTION_STATUSES.has(sub.status ?? "");

      if (isDead) {
        log?.info(
          { userId, subId, status: sub.status },
          "Assinatura Asaas inativa — limpando para novo checkout",
        );
        await prisma.user.update({
          where: { id: userId },
          data: { asaasSubscriptionId: null },
        });
        return null;
      }

      if (sub.billingType === billingType) return subId;

      log?.info(
        { userId, subId, from: sub.billingType, to: billingType },
        "Assinatura Asaas com billingType diferente — recriando",
      );

      try {
        await this.api(
          `/subscriptions/${subId}`,
          { method: "DELETE" },
          "deleteSubscriptionBillingMismatch",
        );
      } catch (err) {
        if (!(err instanceof AsaasApiError) || err.statusCode !== 404) {
          throw err;
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: { asaasSubscriptionId: null },
      });
      return null;
    } catch (err) {
      if (err instanceof AsaasApiError && err.statusCode === 404) {
        await prisma.user.update({
          where: { id: userId },
          data: { asaasSubscriptionId: null },
        });
        return null;
      }
      throw err;
    }
  }

  /** Reaproveita cobrança pendente recente (evita dupla assinatura no double-click). */
  private async resumePendingCheckout(
    user: {
      id: string;
      asaasSubscriptionId: string | null;
      subscriptionPaymentMethod: string;
    },
    paymentMethod: string,
    log?: FastifyBaseLogger,
  ): Promise<SubscribeCheckoutResult | null> {
    const since = new Date(Date.now() - PENDING_CHECKOUT_MAX_AGE_MS);
    const pending = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        chargeKind: "SUBSCRIPTION",
        status: "PENDING",
        createdAt: { gte: since },
        asaasChargeId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    const billingType = toAsaasBillingType(paymentMethod);

    if (pending?.asaasChargeId) {
      try {
        const remote = await this.getPaymentById(pending.asaasChargeId);
        const isDirectPixCheckout =
          billingType === "PIX" &&
          remote.billingType !== "CREDIT_CARD" &&
          !remote.subscription &&
          !user.asaasSubscriptionId;
        if (!remote.subscription && !user.asaasSubscriptionId && !isDirectPixCheckout) {
          return null;
        }
        if (
          remote.billingType &&
          remote.billingType !== billingType &&
          remote.billingType !== "UNDEFINED"
        ) {
          return null;
        }
        log?.info(
          { userId: user.id, chargeId: pending.asaasChargeId },
          "Reaproveitando cobrança pendente",
        );
        const checkout = await this.buildCheckoutFromPayment(
          remote,
          pending.asaasChargeId,
          billingType,
          user.id,
          user.asaasSubscriptionId ?? remote.subscription ?? pending.asaasChargeId,
        );
        try {
          this.assertCheckoutReady(checkout, billingType, false);
          return checkout;
        } catch {
          return null;
        }
      } catch {
        return null;
      }
    }

    if (user.asaasSubscriptionId) {
      const payments = await this.api<{ data?: AsaasPayment[] }>(
        `/subscriptions/${user.asaasSubscriptionId}/payments?limit=5`,
        {},
        "listSubscriptionPaymentsOpen",
      );
      const open = payments.data?.find(
        (p) =>
          p.status === "PENDING" ||
          p.status === "OVERDUE" ||
          p.status === "AWAITING_RISK_ANALYSIS",
      );
      if (open?.id) {
        if (
          open.billingType &&
          open.billingType !== billingType &&
          open.billingType !== "UNDEFINED"
        ) {
          return null;
        }
        const checkout = await this.buildCheckoutFromPayment(
          open,
          open.id,
          billingType,
          user.id,
          user.asaasSubscriptionId,
        );
        try {
          this.assertCheckoutReady(checkout, billingType, false);
          return checkout;
        } catch {
          return null;
        }
      }
    }

    return null;
  }

  async cancelSubscription(
    userId: string,
    log?: FastifyBaseLogger,
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    if (!this.configured) {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "CANCELED", asaasSubscriptionId: null },
      });
      return;
    }

    if (user.asaasSubscriptionId) {
      try {
        await this.api(
          `/subscriptions/${user.asaasSubscriptionId}`,
          { method: "DELETE" },
          "cancelSubscription",
        );
      } catch (err) {
        if (!(err instanceof AsaasApiError) || err.statusCode !== 404) {
          log?.error(
            { err, subscriptionId: user.asaasSubscriptionId },
            "Falha ao cancelar assinatura no Asaas",
          );
          throw err;
        }
      }
    }

    await prisma.payment.updateMany({
      where: {
        userId,
        chargeKind: "SUBSCRIPTION",
        status: "PENDING",
      },
      data: { status: "FAILED" },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "CANCELED",
        asaasSubscriptionId: null,
      },
    });
  }

  private async fetchPixQrWithAttempts(
    paymentId: string,
    maxAttempts: number,
  ): Promise<{ payload: string | null; encodedImage: string | null }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pix = await this.api<AsaasPixQr>(
        `/payments/${paymentId}/pixQrCode`,
        {},
        "getPixQrCode",
      );
      const payload = pix.payload?.trim() || null;
      const encodedImage = pix.encodedImage?.trim() || null;
      if (payload || encodedImage) {
        setCachedPixQr(paymentId, payload, encodedImage);
        return { payload, encodedImage };
      }
      if (attempt < maxAttempts - 1) {
        await sleep(PIX_QR_POLL_MS);
      }
    }
    return { payload: null, encodedImage: null };
  }

  private async fetchPixQr(
    paymentId: string,
    billingType: string,
    throwOnError = false,
  ): Promise<{ payload: string | null; encodedImage: string | null }> {
    if (billingType !== "PIX") {
      return { payload: null, encodedImage: null };
    }
    const pix = await this.fetchPixQrWithAttempts(
      paymentId,
      throwOnError ? PIX_QR_QUICK_ATTEMPTS : PIX_QR_QUICK_ATTEMPTS,
    );
    if (throwOnError && !pix.payload && !pix.encodedImage) {
      throw Object.assign(
        new Error(
          "Asaas ainda não liberou o QR Pix desta cobrança. Aguarde alguns segundos e tente novamente.",
        ),
        { statusCode: 502, code: "PIX_QR_EMPTY" },
      );
    }
    return pix;
  }

  private async ensurePendingPaymentRecord(
    userId: string,
    asaasChargeId: string,
  ): Promise<void> {
    try {
      await withPrismaRetry(() =>
        prisma.payment.create({
          data: {
            userId,
            asaasChargeId,
            status: "PENDING",
            amount: SUBSCRIPTION_PRICE,
            chargeKind: "SUBSCRIPTION",
          },
        }),
      );
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "P2002") throw err;
    }
  }

  private async createMockCharge(userId: string, amount: number) {
    const mockId = `mock_pay_${userId}_${Date.now()}`;
    const invoiceUrl = `${this.env.APP_URL}/assinar?mock=1&user=${userId}`;
    await prisma.payment.create({
      data: {
        userId,
        asaasChargeId: mockId,
        status: "PENDING",
        amount,
        chargeKind: "SUBSCRIPTION",
      },
    });
    return {
      paymentId: mockId,
      invoiceUrl,
      pixCopyPaste:
        "00020126580014br.gov.bcb.pix0136123e456789-e.mock-MOTOCOPILOTO520400005303986540514.905802BR5925Motocopiloto6009SAO PAULO62070503***6304ABCD",
      pixQrCodeImage: null,
      chargeId: mockId,
      amount,
    };
  }

  async handleWebhook(
    payload: AsaasWebhookPayload,
    log?: FastifyBaseLogger,
  ): Promise<void> {
    await processAsaasWebhook(payload, {
      log: log ?? this.log,
      env: this.env,
    });
  }
}
