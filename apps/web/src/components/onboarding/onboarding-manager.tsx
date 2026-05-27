"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppData } from "@/components/app-data-provider";
import { isAppTourSeen } from "@/lib/onboarding";
import { ConfigSetupGuide } from "./config-setup-guide";
import { AppIntroTour } from "./app-intro-tour";

const ALLOW_WITHOUT_CONFIG = ["/config", "/assinar"];

function OnboardingManagerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { configComplete } = useAppData();

  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showAppTour, setShowAppTour] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);

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
