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
    label: "Pix recorrente",
    hint: "Cobrança mensal via Pix (Asaas)",
  },
  {
    id: "CREDIT_CARD",
    label: "Cartão de crédito",
    hint: "Débito no cartão (Asaas)",
  },
  {
    id: "BOLETO",
    label: "Boleto",
    hint: "Boleto mensal (Asaas)",
  },
];

export function subscriptionPaymentLabel(
  method: SubscriptionPaymentMethod,
): string {
  return (
    SUBSCRIPTION_PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method
  );
}
