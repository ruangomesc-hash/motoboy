import { AppRealtimeSync } from "@/components/app-realtime-sync";
import { BottomNav } from "@/components/bottom-nav";
import { DemoBanner } from "@/components/demo-banner";
import { SubscriptionGate } from "@/components/subscription-gate";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden">
      <AppRealtimeSync />
      <DemoBanner />
      <SubscriptionGate>
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </main>
        <BottomNav />
      </SubscriptionGate>
    </div>
  );
}
