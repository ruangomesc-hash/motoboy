"use client";

import { Clock } from "lucide-react";
import { TRIAL_DAYS } from "@motoboy/types";
import { trialPolicySummary } from "@/lib/admin-trial";

export function AdminTrialPolicyBar({
  trialDays = TRIAL_DAYS,
  className = "",
}: {
  trialDays?: number;
  className?: string;
}) {
  return (
    <div
      className={`mx-4 mt-4 md:mx-8 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 flex gap-3 items-start ${className}`}
      role="status"
    >
      <Clock
        className="h-5 w-5 text-amber-400 shrink-0 mt-0.5"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-amber-100">
          Trial em uso:{" "}
          <span className="text-amber-300 tabular-nums">{trialDays} dias</span>{" "}
          por cadastro
        </p>
        <p className="text-xs text-amber-100/75 mt-1 leading-relaxed">
          {trialPolicySummary(trialDays)}
        </p>
      </div>
    </div>
  );
}
