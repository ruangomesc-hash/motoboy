"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { MotocopilotoLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const HOME_PHRASES = [
  "Preparando seu painel do dia…",
  "Sincronizando entregas e custos…",
  "Calculando lucro e km rodados…",
  "Organizando o resumo de hoje…",
  "Quase lá — seu copiloto na rua.",
];

const ACCOUNT_PHRASES = [
  "Conectando com sua conta…",
  "Verificando seu acesso…",
  "Preparando tudo para você…",
  "Quase pronto para rodar.",
];

export function AppLoadingSplash({
  variant = "home",
  className,
}: {
  variant?: "home" | "account";
  className?: string;
}) {
  const phrases = variant === "account" ? ACCOUNT_PHRASES : HOME_PHRASES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [phrases.length]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "min-h-[min(100%,calc(100dvh-7rem))] px-8 py-10",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={phrases[index]}
    >
      <MotocopilotoLogo size="lg" centered className="scale-110" />

      <Loader2
        className="mt-8 h-7 w-7 text-emerald-400 animate-spin"
        strokeWidth={2}
        aria-hidden
      />

      <p
        key={index}
        className="mt-6 min-h-[2.75rem] max-w-[280px] text-center text-sm text-muted-foreground animate-in fade-in duration-500"
      >
        {phrases[index]}
      </p>

      <div className="mt-5 flex gap-1.5" aria-hidden>
        {phrases.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index
                ? "w-4 bg-emerald-400"
                : "w-1.5 bg-muted-foreground/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
