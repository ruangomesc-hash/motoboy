import type { DeliverySource, SubscriptionPaymentMethod } from "@motocheck/types";

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
    label: "Pix recorrente",
    hint: "Cobrança automática via Pix",
  },
  {
    id: "CREDIT_CARD",
    label: "Cartão de crédito",
    hint: "Débito automático no cartão",
  },
  {
    id: "BOLETO",
    label: "Boleto",
    hint: "Boleto mensal",
  },
];

export function subscriptionPaymentLabel(
  method: SubscriptionPaymentMethod,
): string {
  return (
    SUBSCRIPTION_PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method
  );
}
