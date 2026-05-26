"use client";

import { useIsDemoMode } from "@/hooks/use-api";

export function DemoBanner() {
  const isDemo = useIsDemoMode();
  if (!isDemo) return null;

  return (
    <div className="shrink-0 bg-amber-500/15 border-b border-amber-500/30 px-3 py-2 text-center text-xs text-amber-200">
      Motocopiloto · modo demonstração — dados fictícios
    </div>
  );
}
