"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { SubscriptionStatus } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";

const ALLOWED_PATHS = ["/assinar", "/config"];

/** Redireciona para assinatura se trial expirou (área exclusiva só com acesso válido). */
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status: sessionStatus } = useSession();
  const api = useApi();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setChecked(true);
      return;
    }

    if (ALLOWED_PATHS.some((p) => pathname.startsWith(p))) {
      setChecked(true);
      return;
    }

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
        if (!active) {
          router.replace("/assinar");
          return;
        }
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [api, pathname, router, sessionStatus]);

  if (!checked && sessionStatus === "authenticated") {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Carregando sua conta...
      </div>
    );
  }

  return <>{children}</>;
}
