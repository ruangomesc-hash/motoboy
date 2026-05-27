"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import { APP_SYNC_EVENT, type AppSyncDetail } from "@/lib/app-sync";
import {
  isAppTourSeen,
  isServerConfigComplete,
  type MeConfigSnapshot,
} from "@/lib/onboarding";
import { ConfigSetupGuide } from "./config-setup-guide";
import { AppIntroTour } from "./app-intro-tour";

const ALLOW_WITHOUT_CONFIG = ["/config", "/assinar"];

function OnboardingManagerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const api = useApi();

  const [configComplete, setConfigComplete] = useState<boolean | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showAppTour, setShowAppTour] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);

  const refreshConfigStatus = useCallback(async () => {
    try {
      const me = await api<MeConfigSnapshot>("/me");
      const complete = isServerConfigComplete(me);
      setConfigComplete(complete);
      if (complete) setGuideDismissed(false);
      return complete;
    } catch {
      setConfigComplete(false);
      return false;
    }
  }, [api]);

  useEffect(() => {
    if (status !== "authenticated") {
      setConfigComplete(null);
      return;
    }
    void refreshConfigStatus();
  }, [status, refreshConfigStatus]);

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<AppSyncDetail>).detail;
      const topics = detail?.topics ?? [];
      if (
        topics.includes("all") ||
        topics.includes("profile") ||
        topics.includes("today")
      ) {
        void refreshConfigStatus();
      }
    };
    window.addEventListener(APP_SYNC_EVENT, onSync);
    return () => window.removeEventListener(APP_SYNC_EVENT, onSync);
  }, [refreshConfigStatus]);

  useEffect(() => {
    if (status !== "authenticated" || configComplete !== false) return;
    const allowed = ALLOW_WITHOUT_CONFIG.some((p) => pathname.startsWith(p));
    if (!allowed) {
      router.replace("/config?setup=1");
    }
  }, [status, configComplete, pathname, router]);

  useEffect(() => {
    if (pathname !== "/config") {
      setShowConfigGuide(false);
      setGuideDismissed(false);
      return;
    }

    const replayGuide = searchParams.get("guide") === "1";

    if (configComplete === false) {
      setShowConfigGuide(!guideDismissed);
      return;
    }

    if (configComplete === true && replayGuide) {
      setShowConfigGuide(true);
      return;
    }

    setShowConfigGuide(false);
  }, [pathname, searchParams, configComplete, guideDismissed]);

  useEffect(() => {
    if (searchParams.get("tour") !== "1") return;
    if (!configComplete || isAppTourSeen()) return;
    setShowAppTour(true);
    router.replace("/");
  }, [searchParams, configComplete, router]);

  if (status !== "authenticated") return null;

  const configGuideSkippable = configComplete === true;

  return (
    <>
      <ConfigSetupGuide
        active={showConfigGuide}
        allowSkip={configGuideSkippable}
        onFinished={() => {
          if (configGuideSkippable) {
            setShowConfigGuide(false);
          } else {
            setGuideDismissed(true);
          }
        }}
      />
      <AppIntroTour
        active={showAppTour}
        onClose={() => setShowAppTour(false)}
      />
    </>
  );
}

export function OnboardingManager() {
  return (
    <Suspense fallback={null}>
      <OnboardingManagerInner />
    </Suspense>
  );
}
