import { AppLoadingSplash } from "@/components/app-loading-splash";

/** Fallback imediato (antes do React hidratar) — evita flash branco. */
export default function AppRouteLoading() {
  return (
    <div className="flex flex-1 min-h-full w-full bg-background">
      <AppLoadingSplash variant="startup" className="flex-1" />
    </div>
  );
}
