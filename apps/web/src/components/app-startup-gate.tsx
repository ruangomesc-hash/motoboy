"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppData } from "@/components/app-data-provider";
import { AppLoadingSplash } from "@/components/app-loading-splash";

const MIN_VISIBLE_MS = 500;

/**
 * Cobre tela branca na abertura: sessão + cache/API até o app estar pronto.
 */
export function AppStartupGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { isBootstrapped } = useAppData();
  const [mounted, setMounted] = useState(false);
  const [holdVisible, setHoldVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const waitingSession = status === "loading";
  const waitingData = status === "authenticated" && !isBootstrapped;
  const stillLoading = !mounted || waitingSession || waitingData;

  useEffect(() => {
    if (stillLoading) {
      setHoldVisible(true);
      return;
    }
    const t = window.setTimeout(() => setHoldVisible(false), MIN_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [stillLoading]);

  const showOverlay = stillLoading || holdVisible;

  return (
    <>
      {children}
      {showOverlay && (
        <div
          className="fixed inset-0 z-[220] flex flex-col bg-background"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Carregando aplicativo"
        >
          <AppLoadingSplash
            variant={waitingSession ? "account" : "startup"}
            className="flex-1 min-h-0"
          />
        </div>
      )}
    </>
  );
}
