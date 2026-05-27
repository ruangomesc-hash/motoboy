"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import {
  isAppTourDone,
  isConfigOnboardingDone,
  isServerConfigComplete,
  markConfigOnboardingDone,
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

  const refreshConfigStatus = useCallback(async () => {
    try {
      const me = await api<MeConfigSnapshot>("/me");
      const complete =
        isServerConfigComplete(me) || isConfigOnboardingDone();
      setConfigComplete(complete);
      if (isServerConfigComplete(me)) markConfigOnboardingDone();
      return complete;
    } catch {
      const local = isConfigOnboardingDone();
      setConfigComplete(local);
      return local;
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
    if (status !== "authenticated" || configComplete !== false) return;
    const allowed = ALLOW_WITHOUT_CONFIG.some((p) => pathname.startsWith(p));
    if (!allowed) {
      router.replace("/config?setup=1");
    }
  }, [status, configComplete, pathname, router]);

  useEffect(() => {
    if (pathname !== "/config") {
      setShowConfigGuide(false);
      return;
    }
    const forceGuide =
      searchParams.get("setup") === "1" ||
      searchParams.get("guide") === "1" ||
      configComplete === false;
    setShowConfigGuide(forceGuide);
  }, [pathname, searchParams, configComplete]);

  useEffect(() => {
    if (searchParams.get("tour") === "1" && configComplete && !isAppTourDone()) {
      setShowAppTour(true);
      router.replace("/");
    }
  }, [searchParams, configComplete, router]);

  useEffect(() => {
    if (
      configComplete &&
      pathname === "/" &&
      !isAppTourDone() &&
      searchParams.get("tour") !== "1" &&
      isConfigOnboardingDone() &&
      !showAppTour
    ) {
      const seen = sessionStorage.getItem("motocopiloto_tour_prompted");
      if (!seen) {
        sessionStorage.setItem("motocopiloto_tour_prompted", "1");
        const t = window.setTimeout(() => setShowAppTour(true), 600);
        return () => window.clearTimeout(t);
      }
    }
  }, [configComplete, pathname, searchParams, showAppTour]);

  if (status !== "authenticated") return null;

  return (
    <>
      <ConfigSetupGuide
        active={showConfigGuide}
        onFinished={() => setShowConfigGuide(false)}
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
