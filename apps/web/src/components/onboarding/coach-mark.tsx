"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function CoachMark({
  open,
  title,
  children,
  step,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  nextLabel = "Próximo",
  showBack = true,
  className,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md rounded-2xl border border-emerald-500/30",
          "bg-[#0a0f0d]/98 shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-md",
          "p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
              Passo {step} de {totalSteps}
            </p>
            <h2 id="coach-title" className="text-lg font-semibold leading-tight">
              {title}
            </h2>
          </div>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Pular"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          {children}
        </div>

        <div className="flex gap-1.5 justify-center pt-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i + 1 === step
                  ? "w-5 bg-emerald-400"
                  : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {showBack && onBack && step > 1 && (
            <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
              Voltar
            </Button>
          )}
          <Button type="button" className="flex-1" onClick={onNext}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CoachBackdrop({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[1px] animate-in fade-in duration-200"
      aria-hidden
    />
  );
}
