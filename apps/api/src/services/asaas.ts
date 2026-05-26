import type { Env } from "@motoboy/types";
import { prisma } from "@motoboy/db";
import {
  asaasRequest,
  AsaasApiError,
  isAsaasConfigured,
  toAsaasBillingType,
} from "../lib/asaas-client.js";
import { SUBSCRIPTION_PRICE } from "./admin-metrics.js";

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
};
type AsaasPixQr = { payload?: string; encodedImage?: string };
type AsaasSubscription = { id: string };

export class AsaasService {
  constructor(private env: Env) {}

  get configured(): boolean {
    return isAsaasConfigured(this.env);
  }

  /** Status da integração (painel / health). */
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
        const existing = await asaasRequest<AsaasCustomer>(
          this.env,
          `/customers/${user.asaasCustomerId}`,
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

    const listed = await asaasRequest<AsaasCustomerList>(
      this.env,
      `/customers?externalReference=${encodeURIComponent(user.id)}&limit=1`,
    );
    const found = listed.data?.[0];
    if (found?.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId: found.id },
      });
      return found.id;
    }

    const created = await asaasRequest<AsaasCustomer>(this.env, "/customers", {
      method: "POST",
      body: JSON.stringify({
        name: user.name?.trim() || "Motoboy Motocopiloto",
        email: user.email ?? undefined,
        mobilePhone: formatPhoneForAsaas(user.whatsappNumber),
        externalReference: user.id,
        notificationDisabled: false,
      }),
    });

    if (!created.id) {
      throw new Error("Asaas não retornou ID do cliente");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { asaasCustomerId: created.id },
    });

    return created.id;
  }

  async createPaymentCharge(
    userId: string,
    paymentMethod: string = "PIX",
  ): Promise<{
    paymentId: string;
    invoiceUrl: string;
    pixCopyPaste: string | null;
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

    const payment = await asaasRequest<AsaasPayment>(this.env, "/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType,
        value: amount,
        dueDate: dueDatePlusDays(3),
        description: "Motocopiloto — assinatura mensal",
        externalReference: userId,
      }),
    });

    if (!payment.id) {
      throw new Error("Falha ao criar cobrança no Asaas");
    }

    const pixCopyPaste = await this.fetchPixPayload(payment.id, billingType);

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
      pixCopyPaste,
      chargeId: payment.id,
      amount,
    };
  }

  /** Assinatura recorrente mensal no Asaas + primeira cobrança. */
  async createSubscription(userId: string, paymentMethod: string = "PIX") {
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
        amount: mock.amount,
      };
    }

    const customerId = await this.getOrCreateCustomer(user);
    const billingType = toAsaasBillingType(paymentMethod);

    const sub = await asaasRequest<AsaasSubscription>(
      this.env,
      "/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType,
          value: SUBSCRIPTION_PRICE,
          cycle: "MONTHLY",
          description: "Motocopiloto — assinatura mensal",
          externalReference: userId,
        }),
      },
    );

    if (!sub.id) {
      throw new Error("Falha ao criar assinatura no Asaas");
    }

    const payments = await asaasRequest<{ data?: AsaasPayment[] }>(
      this.env,
      `/subscriptions/${sub.id}/payments?limit=1`,
    );
    const first = payments.data?.[0];

    const chargeId = first?.id ?? sub.id;
    const pixCopyPaste = first?.id
      ? await this.fetchPixPayload(first.id, billingType)
      : null;

    const invoiceUrl =
      first?.invoiceUrl ??
      first?.bankSlipUrl ??
      `${this.env.APP_URL}/assinar?subscription=${sub.id}`;

    await prisma.payment.create({
      data: {
        userId,
        asaasChargeId: chargeId,
        status: "PENDING",
        amount: SUBSCRIPTION_PRICE,
      },
    });

    return {
      checkoutUrl: invoiceUrl,
      chargeId,
      invoiceUrl,
      pixCopyPaste,
      amount: SUBSCRIPTION_PRICE,
      subscriptionId: sub.id,
    };
  }

  private async fetchPixPayload(
    paymentId: string,
    billingType: string,
  ): Promise<string | null> {
    if (billingType !== "PIX") return null;
    try {
      const pix = await asaasRequest<AsaasPixQr>(
        this.env,
        `/payments/${paymentId}/pixQrCode`,
      );
      return pix.payload ?? null;
    } catch {
      return null;
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
      chargeId: mockId,
      amount,
    };
  }

  async handleWebhook(payload: {
    event?: string;
    payment?: {
      id?: string;
      status?: string;
      subscription?: string;
      externalReference?: string;
    };
  }): Promise<void> {
    const event = payload.event ?? "";
    const paymentRef = payload.payment;
    const chargeId =
      paymentRef?.id ?? paymentRef?.subscription ?? undefined;

    let payment = chargeId
      ? await prisma.payment.findFirst({
          where: { asaasChargeId: chargeId },
          include: { user: true },
        })
      : null;

    if (!payment && paymentRef?.externalReference) {
      payment = await prisma.payment.findFirst({
        where: {
          userId: paymentRef.externalReference,
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
      if (payment && chargeId) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { asaasChargeId: chargeId },
        });
      }
    }

    if (!payment) return;

    const paidEvents = new Set([
      "PAYMENT_RECEIVED",
      "PAYMENT_CONFIRMED",
      "PAYMENT_RECEIVED_IN_CASH",
    ]);
    const failedEvents = new Set([
      "PAYMENT_OVERDUE",
      "PAYMENT_DELETED",
      "PAYMENT_REFUNDED",
    ]);

    const status = paymentRef?.status;
    const isPaid =
      paidEvents.has(event) ||
      status === "RECEIVED" ||
      status === "CONFIRMED";

    const isFailed =
      failedEvents.has(event) ||
      status === "OVERDUE" ||
      status === "REFUNDED";

    if (isPaid) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: {
            status: "ACTIVE",
            subscribedAt: payment.user.subscribedAt ?? new Date(),
            trialEndsAt: null,
          },
        }),
      ]);
      return;
    }

    if (isFailed) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: event === "PAYMENT_REFUNDED" ? "REFUNDED" : "FAILED",
        },
      });
    }
  }
}
