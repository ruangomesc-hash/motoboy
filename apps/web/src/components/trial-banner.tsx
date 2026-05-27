"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL, TRIAL_DAYS } from "@motoboy/types";
import {
  formatTrialEndsLabel,
  isTrialActive,
  trialDaysRemaining,
} from "@/lib/trial";
import { formatBRL } from "@/lib/utils";

const DISMISS_KEY = "motocopiloto_trial_banner_dismiss_v1";

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(DISMISS_KEY) === "1";
}

function dismissBanner(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DISMISS_KEY, "1");
}

export function TrialBanner() {
  const pathname = usePathname();
  const { status } = useSession();
  const api = useApi();
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(isDismissed());
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void api<SubscriptionStatus>("/me/subscription")
      .then((data) => {
        if (!cancelled) setSub(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [api, status]);

  if (pathname.startsWith("/assinar") || dismissed !== false) return null;
  if (!isTrialActive(sub)) return null;

  const days = trialDaysRemaining(sub!.trialEndsAt);
  if (days === null) return null;

  const endDate = new Date(sub!.trialEndsAt!);
  const endLabel = endDate.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });

  const priceLabel = formatBRL(SUBSCRIPTION_PRICE_BRL);

  function close() {
    dismissBanner();
    setDismissed(true);
  }

  return (
    <div
      className="relative z-40 shrink-0 mx-2 mt-2 sm:mx-3 rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-[#0a0f0d] px-3 py-3 shadow-lg shadow-amber-950/40"
      role="region"
      aria-label="Aviso de período de trial"
    >
      <button
        type="button"
        onClick={close}
        className="absolute top-2 right-2 rounded-md p-1.5 text-amber-200/80 hover:text-amber-50 hover:bg-white/10 transition-colors"
        aria-label="Fechar aviso"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/90">
          Trial grátis · {sub!.trialDays ?? TRIAL_DAYS} dias
        </p>
        <p className="text-base font-bold text-amber-50 mt-1 leading-snug">
          {formatTrialEndsLabel(days)}
        </p>
        <p className="text-sm text-amber-100/85 mt-1.5 leading-relaxed">
          Você está no trial até <strong className="font-semibold">{endLabel}</strong>.
          Depois, o Motocopiloto Pro custa{" "}
          <strong className="font-semibold text-amber-50">{priceLabel}/mês</strong>{" "}
          para continuar registrando entregas e vendo seu lucro.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 border-amber-500/40 bg-transparent text-amber-50 hover:bg-amber-500/15"
          onClick={close}
        >
          Entendi
        </Button>
        <Button
          asChild
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
        >
          <Link href="/assinar">Contratar Pro</Link>
        </Button>
      </div>
    </div>
  );
}
