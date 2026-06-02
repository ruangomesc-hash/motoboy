import type { Env } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL } from "@motoboy/types";
import { prisma } from "@motoboy/db";
import { findUserByPhone } from "./user.js";
import { normalizePhone } from "../lib/phone.js";

const PAID_STATUS = new Set([
  "paid",
  "pago",
  "approved",
  "completed",
  "complete",
  "confirmed",
  "success",
]);

const REFUND_STATUS = new Set([
  "refunded",
  "reembolsado",
  "refund",
  "chargeback",
  "cancelled",
  "canceled",
  "cancelado",
]);

export function isCartpandaConfigured(env: Env): boolean {
  return Boolean(env.CARTPANDA_CHECKOUT_URL?.trim());
}

export function cartpandaConnectionStatus(env: Env): {
  configured: boolean;
  checkoutUrl: string;
  webhookPath: string;
} {
  const checkoutUrl =
    env.CARTPANDA_CHECKOUT_URL?.trim() ||
    "https://assinatura.motocopiloto.com.br";
  return {
    configured: isCartpandaConfigured(env),
    checkoutUrl,
    webhookPath: "/api/backend/webhooks/cartpanda",
  };
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Telefone para o checkout (preferência 11 dígitos BR). */
function phoneForCheckout(whatsappNumber: string): string {
  const d = digitsOnly(whatsappNumber);
  if (d.length === 13 && d.startsWith("55")) return d.slice(2);
  if (d.length === 12 && d.startsWith("55")) return d.slice(2);
  return d;
}

export function buildCartpandaCheckoutUrl(
  env: Env,
  user: {
    id: string;
    email: string | null;
    whatsappNumber: string;
    name: string | null;
  },
): string {
  const raw = env.CARTPANDA_CHECKOUT_URL?.trim();
  const base = raw || "https://assinatura.motocopiloto.com.br";
  const url = new URL(base.includes("://") ? base : `https://${base}`);

  if (user.email?.trim()) {
    url.searchParams.set("email", user.email.trim().toLowerCase());
  }
  const phone = phoneForCheckout(user.whatsappNumber);
  if (phone.length >= 10) {
    url.searchParams.set("phone", phone);
    url.searchParams.set("phone_number", phone);
  }
  if (user.name?.trim()) {
    url.searchParams.set("name", user.name.trim());
  }

  url.searchParams.set("utm_source", "motocopiloto");
  url.searchParams.set("utm_medium", "app");
  url.searchParams.set("utm_content", user.id);

  return url.toString();
}

export type CartpandaOrderIdentity = {
  orderId: string | null;
  email: string | null;
  phone: string | null;
  amount: number | null;
  status: string | null;
  event: string | null;
};

function pickString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function walkObjects(
  node: unknown,
  visit: (obj: Record<string, unknown>, depth: number) => void,
  depth = 0,
): void {
  if (!node || typeof node !== "object" || depth > 6) return;
  if (Array.isArray(node)) {
    for (const item of node) walkObjects(item, visit, depth + 1);
    return;
  }
  const obj = node as Record<string, unknown>;
  visit(obj, depth);
  for (const value of Object.values(obj)) {
    walkObjects(value, visit, depth + 1);
  }
}

/** Extrai identidade do pedido de payloads CartPanda (formatos variam por evento). */
export function parseCartpandaWebhookPayload(
  body: unknown,
): CartpandaOrderIdentity {
  const found: CartpandaOrderIdentity = {
    orderId: null,
    email: null,
    phone: null,
    amount: null,
    status: null,
    event: null,
  };

  if (body && typeof body === "object") {
    const root = body as Record<string, unknown>;
    found.event = pickString(root.event, root.type, root.name, root.action);
  }

  walkObjects(body, (obj) => {
    found.orderId ??= pickString(
      obj.id,
      obj.order_id,
      obj.orderId,
      obj.transaction_id,
      obj.transactionId,
    );
    found.email ??= pickString(
      obj.email,
      obj.customer_email,
      obj.buyer_email,
      obj.client_email,
    );
    found.phone ??= pickString(
      obj.phone,
      obj.phone_number,
      obj.customer_phone,
      obj.buyer_phone,
      obj.mobile,
      obj.whatsapp,
    );
    found.status ??= pickString(
      obj.status,
      obj.payment_status,
      obj.order_status,
    );
    if (found.amount == null) {
      const raw = obj.amount ?? obj.total ?? obj.total_price ?? obj.value;
      if (typeof raw === "number" && Number.isFinite(raw)) found.amount = raw;
      else if (typeof raw === "string") {
        const n = Number(raw.replace(",", "."));
        if (Number.isFinite(n)) found.amount = n;
      }
    }
  });

  return {
    ...found,
    email: found.email?.toLowerCase() ?? null,
    phone: normalizeCartpandaPhone(found.phone),
  };
}

function normalizeCartpandaPhone(phone: string | null): string | null {
  if (!phone) return null;
  try {
    return normalizePhone(phone);
  } catch {
    const digits = digitsOnly(phone);
    return digits.length >= 10 ? digits : null;
  }
}

export function isCartpandaPaidEvent(identity: CartpandaOrderIdentity): boolean {
  const event = (identity.event ?? "").toLowerCase();
  if (
    event.includes("paid") ||
    event.includes("pago") ||
    event.includes("payment_confirmed") ||
    event.includes("order.paid")
  ) {
    return true;
  }
  const status = (identity.status ?? "").toLowerCase();
  return PAID_STATUS.has(status);
}

export function isCartpandaRefundEvent(
  identity: CartpandaOrderIdentity,
): boolean {
  const event = (identity.event ?? "").toLowerCase();
  if (
    event.includes("refund") ||
    event.includes("reembolso") ||
    event.includes("cancel")
  ) {
    return true;
  }
  const status = (identity.status ?? "").toLowerCase();
  return REFUND_STATUS.has(status);
}

async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } },
  });
}

/** Vincula pedido ao usuário pelo WhatsApp e e-mail do checkout (mesmos do cadastro). */
export async function resolveUserFromCartpandaIdentity(
  identity: CartpandaOrderIdentity,
): Promise<{ id: string } | null> {
  const byPhone = identity.phone
    ? await findUserByPhone(identity.phone)
    : null;
  const byEmail = identity.email
    ? await findUserByEmail(identity.email)
    : null;

  if (identity.email && identity.phone) {
    if (!byPhone || !byEmail || byPhone.id !== byEmail.id) return null;
    return { id: byPhone.id };
  }

  const user = byPhone ?? byEmail;
  return user ? { id: user.id } : null;
}

async function resolveUserWithUtmFallback(
  identity: CartpandaOrderIdentity,
  body: unknown,
): Promise<{ id: string } | null> {
  const direct = await resolveUserFromCartpandaIdentity(identity);
  if (direct) return direct;

  let utmContent: string | null = null;
  walkObjects(body, (obj) => {
    utmContent ??= pickString(
      obj.utm_content,
      obj.utmContent,
      obj.external_reference,
      obj.externalReference,
    );
  });
  if (utmContent?.trim()) {
    const user = await prisma.user.findUnique({
      where: { id: utmContent.trim() },
      select: { id: true },
    });
    if (user) return user;
  }
  return null;
}

export async function createCheckoutForUser(
  env: Env,
  userId: string,
): Promise<{
  checkoutUrl: string;
  amount: number;
  chargeId: string;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado");

  const checkoutUrl = buildCartpandaCheckoutUrl(env, user);
  const chargeId = `cartpanda_pending_${userId}_${Date.now()}`;

  await prisma.payment.create({
    data: {
      userId,
      asaasChargeId: chargeId,
      status: "PENDING",
      amount: SUBSCRIPTION_PRICE_BRL,
    },
  });

  return {
    checkoutUrl,
    amount: SUBSCRIPTION_PRICE_BRL,
    chargeId,
  };
}

export async function handleCartpandaWebhook(
  env: Env,
  body: unknown,
): Promise<{ handled: boolean; reason?: string }> {
  const identity = parseCartpandaWebhookPayload(body);

  if (isCartpandaRefundEvent(identity)) {
    const user = await resolveUserWithUtmFallback(identity, body);
    if (!user) return { handled: false, reason: "user_not_found_refund" };
    const payment = identity.orderId
      ? await prisma.payment.findFirst({
          where: {
            userId: user.id,
            asaasChargeId: identity.orderId,
          },
        })
      : null;
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
    }
    return { handled: true };
  }

  if (!isCartpandaPaidEvent(identity)) {
    return { handled: false, reason: "ignored_event" };
  }

  const user = await resolveUserWithUtmFallback(identity, body);
  if (!user) {
    return { handled: false, reason: "user_not_match" };
  }

  const amount = identity.amount ?? SUBSCRIPTION_PRICE_BRL;
  const orderKey = identity.orderId ?? `cartpanda_${user.id}_${Date.now()}`;

  const existing = identity.orderId
    ? await prisma.payment.findFirst({
        where: { asaasChargeId: identity.orderId },
      })
    : null;

  if (existing?.status === "PAID") {
    return { handled: true, reason: "already_paid" };
  }

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.payment.update({
        where: { id: existing.id },
        data: { status: "PAID", paidAt: new Date(), amount },
      });
    } else {
      await tx.payment.create({
        data: {
          userId: user.id,
          asaasChargeId: orderKey,
          status: "PAID",
          amount,
          paidAt: new Date(),
        },
      });
    }

    const current = await tx.user.findUnique({
      where: { id: user.id },
      select: { subscribedAt: true },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        subscribedAt: current?.subscribedAt ?? new Date(),
        trialEndsAt: null,
      },
    });

    await tx.payment.updateMany({
      where: {
        userId: user.id,
        status: "PENDING",
        ...(identity.orderId
          ? { NOT: { asaasChargeId: identity.orderId } }
          : {}),
      },
      data: { status: "FAILED" },
    });
  });

  return { handled: true };
}
