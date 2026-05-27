"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { SubscriptionStatus } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
const ALLOWED_PATHS = ["/assinar", "/config"];

/** Redireciona para assinatura se trial expirou (checagem em background, sem bloquear a UI). */
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status: sessionStatus } = useSession();
  const api = useApi();

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (ALLOWED_PATHS.some((p) => pathname.startsWith(p))) return;

    let cancelled = false;
    api<SubscriptionStatus>("/me/subscription")
      .then((sub) => {
        if (cancelled) return;
        const trialOk =
          sub.status === "TRIAL" &&
          sub.trialEndsAt &&
          new Date(sub.trialEndsAt) > new Date();
        const active =
          sub.status === "ACTIVE" || sub.status === "PAUSED" || trialOk;
        if (!active) router.replace("/assinar");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [api, pathname, router, sessionStatus]);

  return <>{children}</>;
}
