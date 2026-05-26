"use client";

import { cn } from "@/lib/utils";

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh max-h-dvh overflow-hidden motocheck-desktop-bg flex items-center justify-center p-4 md:p-8">
      <p className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 text-xs text-emerald-400/60 font-medium tracking-wide z-10">
        Motocopiloto · preview mobile
      </p>
      <div
        className={cn(
          "relative w-full max-w-[390px]",
          "h-full max-h-full md:h-[min(844px,90dvh)] md:max-h-[min(844px,90dvh)]",
          "md:rounded-[3rem] md:border-[10px] md:border-emerald-900/80",
          "md:shadow-[0_0_80px_-12px_rgba(16,185,129,0.45)]",
          "overflow-hidden md:bg-background",
          "flex flex-col",
        )}
      >
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-emerald-950 rounded-b-2xl z-20 border-x border-b border-emerald-800/50" />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background md:pt-2">
          {children}
        </div>
        <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-emerald-700/50 rounded-full z-20" />
      </div>
    </div>
  );
}
