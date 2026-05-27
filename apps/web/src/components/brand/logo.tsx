import { Bike } from "lucide-react";
import { cn } from "@/lib/utils";

export function MotocopilotoLogo({
  size = "md",
  className,
  centered = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  centered?: boolean;
}) {
  const box =
    size === "lg"
      ? "h-12 w-12"
      : size === "sm"
        ? "h-9 w-9"
        : "h-10 w-10";
  const iconSize = size === "lg" ? 28 : size === "sm" ? 18 : 22;
  const title =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-xl" : "text-xl";

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 max-w-full min-w-0",
        centered && "justify-center w-full mx-auto",
        className,
      )}
    >
      <div
        className={cn(
          box,
          "rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
          "border border-emerald-500/30",
          "flex items-center justify-center text-emerald-400",
        )}
        aria-hidden
      >
        <Bike size={iconSize} strokeWidth={2} />
      </div>
      <div className="min-w-0 text-left">
        <p className={cn(title, "font-bold tracking-tight text-foreground leading-tight")}>
          Moto<span className="text-emerald-400">copiloto</span>
        </p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-tight">
          Seu copiloto na rua
        </p>
      </div>
    </div>
  );
}

/** @deprecated use MotocopilotoLogo */
export const MotoCheckLogo = MotocopilotoLogo;
