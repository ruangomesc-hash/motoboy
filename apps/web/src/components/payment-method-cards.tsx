"use client";

import { Check } from "lucide-react";
import type { SubscriptionPaymentMethod } from "@motoboy/types";
import {
  SUBSCRIPTION_PAYMENT_OPTIONS_CHECKOUT,
  normalizeSubscriptionPaymentMethod,
  type SubscriptionBillingStatus,
  subscriptionPaymentOptionsForStatus,
} from "@/lib/profile-options";
import { cn } from "@/lib/utils";

type Props = {
  selected: SubscriptionPaymentMethod;
  onSelect?: (id: SubscriptionPaymentMethod) => void;
  /** Método da assinatura em vigor (quando status ACTIVE). */
  activeMethod?: SubscriptionPaymentMethod | null;
  subscriptionActive?: boolean;
  subscribedAt?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  /** Quando o selo já está num banner acima (aba Pagamento). */
  hideActiveBadge?: boolean;
};

export function PaymentMethodCards({
  selected,
  onSelect,
  activeMethod,
  subscriptionActive = false,
  subscribedAt,
  disabled = false,
  readOnly = false,
  hideActiveBadge = false,
  subscriptionStatus,
  options,
}: Props) {
  const activeId = subscriptionActive
    ? normalizeSubscriptionPaymentMethod(activeMethod ?? selected)
    : null;

  const paymentOptions =
    options ??
    (subscriptionStatus != null
      ? subscriptionPaymentOptionsForStatus(subscriptionStatus)
      : subscriptionActive
        ? subscriptionPaymentOptionsForStatus("ACTIVE")
        : SUBSCRIPTION_PAYMENT_OPTIONS_CHECKOUT);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {paymentOptions.map((opt) => {
        const isSelected = selected === opt.id;
        const isActivePlan = activeId === opt.id;
        const Tag = readOnly ? "div" : "button";

        return (
          <div key={opt.id} className="flex flex-col gap-1.5">
            {isActivePlan && !hideActiveBadge && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Assinatura ativa
                </span>
                {subscribedAt && (
                  <span className="text-xs text-muted-foreground">
                    desde{" "}
                    {new Date(subscribedAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            )}
            <Tag
              type={readOnly ? undefined : "button"}
              disabled={disabled && !readOnly}
              onClick={readOnly ? undefined : () => onSelect?.(opt.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors w-full",
                isSelected || isActivePlan
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-card/50",
                disabled && !readOnly && "opacity-50 cursor-not-allowed",
                readOnly && "cursor-default",
              )}
            >
              <span className="font-medium text-foreground block">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.hint}</span>
            </Tag>
          </div>
        );
      })}
    </div>
  );
}
