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
    hint: "Cartão de crédito (em breve)",
  },
  {
    id: "BOLETO",
    label: "Boleto",
    hint: "Legado — não disponível",
  },
];

/** Opções exibidas no app — só Asaas (Pix) por enquanto. */
export const SUBSCRIPTION_PAYMENT_OPTIONS_UI = SUBSCRIPTION_PAYMENT_OPTIONS.filter(
  (o) => o.id === "PIX",
);

export function normalizeSubscriptionPaymentMethod(
  method: SubscriptionPaymentMethod | string | null | undefined,
): SubscriptionPaymentMethod {
  return "PIX";
}

export function subscriptionPaymentLabel(
  method: SubscriptionPaymentMethod,
): string {
  return (
    SUBSCRIPTION_PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method
  );
}
