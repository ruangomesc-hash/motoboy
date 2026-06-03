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

const PENDING_CHECKOUT_MAX_AGE_MS = 30 * 60 * 1000;

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
};
type AsaasPixQr = { payload?: string; encodedImage?: string };
type AsaasSubscription = { id: string };

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

  async getOrCreateCustomer(user: {
    id: string;
    name: string | null;
    email: string | null;
    whatsappNumber: string;
    asaasCustomerId: string | null;
  }): Promise<string> {
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
  ): Promise<SubscribeCheckoutResult> {
    const routeLog = log ?? this.log;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
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

    const resumed = await this.resumePendingCheckout(
      user,
      paymentMethod,
      routeLog,
    );
    if (resumed) return resumed;

    const customerId = await this.getOrCreateCustomer(user);
    const billingType = toAsaasBillingType(paymentMethod);
    const nextDueDate = dueDatePlusDays(1);

    let subId = user.asaasSubscriptionId;
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

    const payments = await this.api<{ data?: AsaasPayment[] }>(
      `/subscriptions/${subId}/payments?limit=1&status=PENDING`,
      {},
      "listSubscriptionPaymentsPending",
    );
    let first = payments.data?.[0];

    if (!first?.id) {
      const all = await this.api<{ data?: AsaasPayment[] }>(
        `/subscriptions/${subId}/payments?limit=1`,
        {},
        "listSubscriptionPayments",
      );
      first = all.data?.[0];
    }

    const chargeId = first?.id ?? subId;
    const pix = first?.id
      ? await this.fetchPixQr(first.id, billingType)
      : { payload: null, encodedImage: null };

    const invoiceUrl =
      first?.invoiceUrl ??
      first?.bankSlipUrl ??
      `${this.env.APP_URL}/assinar?subscription=${subId}`;

    const existingPayment = first?.id
      ? await prisma.payment.findFirst({
          where: { asaasChargeId: first.id },
        })
      : null;

    if (!existingPayment && first?.id) {
      await prisma.payment.create({
        data: {
          userId,
          asaasChargeId: first.id,
          status: "PENDING",
          amount: SUBSCRIPTION_PRICE,
        },
      });
    }

    return {
      checkoutUrl: invoiceUrl,
      chargeId,
      invoiceUrl,
      pixCopyPaste: pix.payload,
      pixQrCodeImage: pix.encodedImage,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId: subId,
    };
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
        status: "PENDING",
        createdAt: { gte: since },
        asaasChargeId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    if (pending?.asaasChargeId) {
      const billingType = toAsaasBillingType(paymentMethod);
      const pix = await this.fetchPixQr(pending.asaasChargeId, billingType);
      log?.info(
        { userId: user.id, chargeId: pending.asaasChargeId },
        "Reaproveitando cobrança Pix pendente",
      );
      return {
        checkoutUrl: `${this.env.APP_URL}/assinar?charge=${pending.asaasChargeId}`,
        chargeId: pending.asaasChargeId,
        invoiceUrl: `${this.env.APP_URL}/assinar?charge=${pending.asaasChargeId}`,
        pixCopyPaste: pix.payload,
        pixQrCodeImage: pix.encodedImage,
        amount: Number(pending.amount),
        subscriptionId: user.asaasSubscriptionId ?? pending.asaasChargeId,
      };
    }

    if (user.asaasSubscriptionId) {
      const billingType = toAsaasBillingType(paymentMethod);
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
        const pix = await this.fetchPixQr(open.id, billingType);
        const existing = await prisma.payment.findFirst({
          where: { asaasChargeId: open.id },
        });
        if (!existing) {
          await prisma.payment.create({
            data: {
              userId: user.id,
              asaasChargeId: open.id,
              status: "PENDING",
              amount: SUBSCRIPTION_PRICE,
            },
          });
        }
        return {
          checkoutUrl:
            open.invoiceUrl ??
            `${this.env.APP_URL}/assinar?charge=${open.id}`,
          chargeId: open.id,
          invoiceUrl:
            open.invoiceUrl ??
            `${this.env.APP_URL}/assinar?charge=${open.id}`,
          pixCopyPaste: pix.payload,
          pixQrCodeImage: pix.encodedImage,
          amount: SUBSCRIPTION_PRICE,
          subscriptionId: user.asaasSubscriptionId,
        };
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

  private async createMockCharge(userId: string, amount: number) {
    const mockId = `mock_pay_${userId}_${Date.now()}`;
    const invoiceUrl = `${this.env.APP_URL}/assinar?mock=1&user=${userId}`;
    await prisma.payment.create({
      data: {
        userId,
        asaasChargeId: mockId,
        status: "PENDING",
        amount,
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
