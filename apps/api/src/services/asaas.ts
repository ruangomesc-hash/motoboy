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
import {
  processAsaasWebhook,
  type AsaasWebhookPayload,
} from "./asaas-webhook.js";
import { ensureRecurringSubscription } from "./asaas-recurring.js";
import {
  formatCpfCnpjError,
  isValidCpfCnpj,
  normalizeCpfCnpjDigits,
} from "../lib/cpf-cnpj.js";

const PENDING_CHECKOUT_MAX_AGE_MS = 30 * 60 * 1000;
const FIRST_PAYMENT_POLL_ATTEMPTS = 10;
const FIRST_PAYMENT_POLL_MS = 800;

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

function dueDatePlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatPhoneForAsaas(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length >= 12) return digits;
  if (digits.length === 11) return `55${digits}`;
  return digits;
}

type AsaasCustomer = { id: string; deleted?: boolean };
type AsaasCustomerList = { data?: AsaasCustomer[] };
type AsaasPayment = {
  id: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  status?: string;
  value?: number;
  billingType?: string;
  subscription?: string;
};
type AsaasPixQr = { payload?: string; encodedImage?: string };
type AsaasSubscription = { id: string; billingType?: string };

export type SubscribeCheckoutResult = {
  checkoutUrl: string;
  chargeId: string;
  invoiceUrl: string;
  pixCopyPaste: string | null;
  pixQrCodeImage: string | null;
  amount: number;
  subscriptionId: string;
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
    sandbox: boolean;
    webhookPath: string;
  } {
    return {
      configured: this.configured,
      sandbox: Boolean(this.env.ASAAS_SANDBOX),
      webhookPath: "/api/backend/webhooks/asaas",
    };
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
      await prisma.user.update({
        where: { id: user.id },
        data: { cpfCnpj },
      });
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
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId: found.id },
      });
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

    await prisma.user.update({
      where: { id: user.id },
      data: { asaasCustomerId: created.id },
    });

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

    const pix = await this.fetchPixQr(payment.id, billingType);

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
    options?: { cpfCnpj?: string },
  ): Promise<SubscribeCheckoutResult> {
    const routeLog = log ?? this.log;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    const cpfRaw = options?.cpfCnpj ?? user.cpfCnpj ?? "";
    const billingType = toAsaasBillingType(paymentMethod);

    if (!cpfRaw.trim()) {
      throw Object.assign(
        new Error("Informe seu CPF para gerar a cobrança."),
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

    await this.syncCustomerCpf(user, cpfRaw);

    const userFresh = await prisma.user.findUnique({ where: { id: userId } });
    if (!userFresh) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    const resumed = await this.resumePendingCheckout(
      userFresh,
      paymentMethod,
      routeLog,
    );
    if (resumed) return resumed;

    const customerId = await this.getOrCreateCustomer(
      userFresh,
      userFresh.cpfCnpj,
    );
    const nextDueDate = dueDatePlusDays(1);

    let subId = userFresh.asaasSubscriptionId;
    subId = await this.ensureSubscriptionBillingType(
      userId,
      subId,
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

    const first = await this.waitForFirstSubscriptionPayment(
      subId,
      billingType,
      routeLog,
    );

    const chargeId = first?.id ?? subId;
    const resolved = await this.buildCheckoutFromPayment(
      first,
      chargeId,
      billingType,
      userId,
      subId,
    );

    this.assertCheckoutReady(resolved, billingType);
    return resolved;
  }

  /**
   * Consulta cobrança pendente no Asaas (fallback se o webhook atrasar).
   */
  async syncSubscriptionPaymentStatus(
    userId: string,
    log?: FastifyBaseLogger,
  ): Promise<{ status: string; activated: boolean }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    if (user.status === "ACTIVE") {
      return { status: user.status, activated: false };
    }

    if (!this.configured) {
      return { status: user.status, activated: false };
    }

    const pending = await prisma.payment.findFirst({
      where: {
        userId,
        chargeKind: "SUBSCRIPTION",
        status: "PENDING",
        asaasChargeId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pending?.asaasChargeId) {
      return { status: user.status, activated: false };
    }

    try {
      const remote = await this.getPaymentById(pending.asaasChargeId);
      const paid = PAID_ASAAS_STATUSES.has(remote.status ?? "");

      if (paid) {
        await prisma.payment.update({
          where: { id: pending.id },
          data: { status: "PAID", paidAt: new Date() },
        });
        await prisma.user.update({
          where: { id: userId },
          data: {
            status: "ACTIVE",
            subscribedAt: user.subscribedAt ?? new Date(),
            trialEndsAt: null,
            subscriptionPaymentMethod:
              remote.billingType === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX",
          },
        });
        log?.info(
          { userId, chargeId: pending.asaasChargeId },
          "Assinatura ativada via sync manual (Asaas)",
        );
        return { status: "ACTIVE", activated: true };
      }
    } catch (err) {
      log?.warn({ err, userId }, "Falha ao sincronizar pagamento no Asaas");
    }

    const refreshed = await prisma.user.findUnique({ where: { id: userId } });
    return { status: refreshed?.status ?? user.status, activated: false };
  }

  private assertCheckoutReady(
    resolved: SubscribeCheckoutResult,
    billingType: string,
  ): void {
    if (
      billingType === "CREDIT_CARD" &&
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
      !resolved.pixCopyPaste &&
      !resolved.pixQrCodeImage
    ) {
      throw Object.assign(
        new Error(
          "Não foi possível gerar o Pix. Confira o CPF e tente novamente.",
        ),
        { statusCode: 502 },
      );
    }
  }

  private async waitForFirstSubscriptionPayment(
    subId: string,
    billingType: string,
    log?: FastifyBaseLogger,
  ): Promise<AsaasPayment | undefined> {
    for (let attempt = 0; attempt < FIRST_PAYMENT_POLL_ATTEMPTS; attempt++) {
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
          const pix = await this.fetchPixQr(first.id, billingType);
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

      if (attempt < FIRST_PAYMENT_POLL_ATTEMPTS - 1) {
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

  private async buildCheckoutFromPayment(
    payment: AsaasPayment | undefined,
    chargeId: string,
    billingType: string,
    userId: string,
    subscriptionId: string,
  ): Promise<SubscribeCheckoutResult> {
    const pix = payment?.id
      ? await this.fetchPixQr(payment.id, billingType)
      : { payload: null, encodedImage: null };

    const invoiceUrl = await this.resolvePaymentInvoiceUrl(payment, chargeId);

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
        if (!remote.subscription && !user.asaasSubscriptionId) {
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
          this.assertCheckoutReady(checkout, billingType);
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
          this.assertCheckoutReady(checkout, billingType);
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "CANCELED",
        asaasSubscriptionId: null,
      },
    });
  }

  private async fetchPixQr(
    paymentId: string,
    billingType: string,
  ): Promise<{ payload: string | null; encodedImage: string | null }> {
    if (billingType !== "PIX") {
      return { payload: null, encodedImage: null };
    }
    try {
      const pix = await this.api<AsaasPixQr>(
        `/payments/${paymentId}/pixQrCode`,
        {},
        "getPixQrCode",
      );
      return {
        payload: pix.payload ?? null,
        encodedImage: pix.encodedImage ?? null,
      };
    } catch {
      return { payload: null, encodedImage: null };
    }
  }

  private async ensurePendingPaymentRecord(
    userId: string,
    asaasChargeId: string,
  ): Promise<void> {
    try {
      await prisma.payment.create({
        data: {
          userId,
          asaasChargeId,
          status: "PENDING",
          amount: SUBSCRIPTION_PRICE,
          chargeKind: "SUBSCRIPTION",
        },
      });
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
