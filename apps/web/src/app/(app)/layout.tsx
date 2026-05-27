import { AppDataProvider } from "@/components/app-data-provider";
import { OnboardingManager } from "@/components/onboarding/onboarding-manager";
import { AppRealtimeSync } from "@/components/app-realtime-sync";
import { BottomNav } from "@/components/bottom-nav";
import { DemoBanner } from "@/components/demo-banner";
import { SubscriptionGate } from "@/components/subscription-gate";
import { TrialBanner } from "@/components/trial-banner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0 w-full max-w-full overflow-hidden overflow-x-hidden">
      <AppRealtimeSync />
      <DemoBanner />
      <TrialBanner />
      <SubscriptionGate>
        <AppDataProvider>
          <OnboardingManager />
          <main className="flex-1 min-h-0 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden overscroll-x-none touch-pan-y overscroll-y-contain [-webkit-overflow-scrolling:touch]">
            {children}
          </main>
          <BottomNav />
        </AppDataProvider>
      </SubscriptionGate>
    </div>
  );
}
