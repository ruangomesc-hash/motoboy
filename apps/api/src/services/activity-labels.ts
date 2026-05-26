import type { DeliverySource, SubscriptionPaymentMethod } from "@motocheck/types";

const SOURCE_LABELS: Record<DeliverySource, string> = {
  IFOOD: "iFood",
  NINETY_NINE: "99Food",
  RAPPI: "Rappi",
  PARTICULAR: "Particular",
  OTHER: "Outros",
};

const SUBSCRIPTION_PAYMENT_LABELS: Record<SubscriptionPaymentMethod, string> = {
  PIX: "Pix recorrente",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};

export function formatDeliverySource(source: string): string {
  return SOURCE_LABELS[source as DeliverySource] ?? source;
}

export function formatWorkApps(apps: unknown): string {
  if (!Array.isArray(apps) || apps.length === 0) return "—";
  return apps.map((a) => formatDeliverySource(String(a))).join(", ");
}

export function formatSubscriptionPayment(method: unknown): string {
  if (typeof method !== "string") return "—";
  return (
    SUBSCRIPTION_PAYMENT_LABELS[method as SubscriptionPaymentMethod] ?? method
  );
}

export function formatMoney(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function formatWorkDaysList(days: unknown): string {
  const parsed = Array.isArray(days)
    ? days
        .map((d) => Number(d))
        .filter((d) => d >= 0 && d <= 6)
        .sort((a, b) => a - b)
    : [];
  if (parsed.length === 0) return "—";
  return parsed.map((d) => WEEKDAY_LABELS[d]).join(", ");
}

export function formatPlain(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}
