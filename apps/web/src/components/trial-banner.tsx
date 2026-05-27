"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import type { SubscriptionStatus } from "@motoboy/types";
import {
  formatTrialEndsLabel,
  isTrialActive,
  trialDaysRemaining,
} from "@/lib/trial";

export function TrialBanner() {
  const { status } = useSession();
  const api = useApi();
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);

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

  if (!isTrialActive(sub)) return null;

  const days = trialDaysRemaining(sub!.trialEndsAt);
  if (days === null) return null;

  const endDate = new Date(sub!.trialEndsAt!);
  const endLabel = endDate.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="mx-3 mt-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm"
      role="status"
    >
      <p className="font-medium text-amber-100">
        {formatTrialEndsLabel(days)}
      </p>
      <p className="text-xs text-amber-100/75 mt-0.5">
        Trial válido até {endLabel}. Depois, assine o Pro para continuar usando
        o app.
      </p>
      <Link
        href="/assinar"
        className="inline-block mt-2 text-xs font-semibold text-emerald-400 underline"
      >
        Ver planos e assinar
      </Link>
    </div>
  );
}
