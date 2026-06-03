import type { DeliverySource, SubscriptionPaymentMethod } from "@motoboy/types";

export const WORK_APP_OPTIONS: {
  id: DeliverySource;
  label: string;
}[] = [
  { id: "IFOOD", label: "iFood" },
  { id: "NINETY_NINE", label: "99Food" },
  { id: "RAPPI", label: "Rappi" },
  { id: "PARTICULAR", label: "Particular" },
  { id: "OTHER", label: "Outros apps" },
];

export const SUBSCRIPTION_PAYMENT_OPTIONS: {
  id: SubscriptionPaymentMethod;
  label: string;
  hint?: string;
}[] = [
  {
    id: "PIX",
    label: "Pix",
    hint: "Pix automático · Asaas",
  },
  {
    id: "CREDIT_CARD",
    label: "Cartão",
    hint: "Cartão de crédito · Asaas",
  },
  {
    id: "BOLETO",
    label: "Boleto",
    hint: "Legado — não disponível",
  },
];

/** Pix + cartão — trial, 1ª assinatura ou inadimplente (PAUSED). */
export const SUBSCRIPTION_PAYMENT_OPTIONS_CHECKOUT =
  SUBSCRIPTION_PAYMENT_OPTIONS.filter(
    (o) => o.id === "PIX" || o.id === "CREDIT_CARD",
  );

/** Legado: manter export para não quebrar imports antigos. */
export const SUBSCRIPTION_PAYMENT_OPTIONS_UI =
  SUBSCRIPTION_PAYMENT_OPTIONS_CHECKOUT;

export type SubscriptionBillingStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELED";

/** Quem pode escolher forma de pagamento antes de assinar / regularizar. */
export function canChooseSubscriptionPaymentMethod(
  status: SubscriptionBillingStatus | string | null | undefined,
): boolean {
  return status !== "ACTIVE";
}

export function subscriptionPaymentOptionsForStatus(
  status: SubscriptionBillingStatus | string | null | undefined,
) {
  if (canChooseSubscriptionPaymentMethod(status)) {
    return SUBSCRIPTION_PAYMENT_OPTIONS_CHECKOUT;
  }
  return SUBSCRIPTION_PAYMENT_OPTIONS.filter((o) => o.id === "PIX" || o.id === "CREDIT_CARD");
}

export function normalizeSubscriptionPaymentMethod(
  method: SubscriptionPaymentMethod | string | null | undefined,
): SubscriptionPaymentMethod {
  if (method === "CREDIT_CARD") return "CREDIT_CARD";
  if (method === "PIX") return "PIX";
  return "PIX";
}

export function subscriptionPaymentLabel(
  method: SubscriptionPaymentMethod,
): string {
  return (
    SUBSCRIPTION_PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method
  );
}
