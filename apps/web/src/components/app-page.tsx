import { cn } from "@/lib/utils";

/** Container padrão das telas do app — evita scroll horizontal no mobile. */
export function AppPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0 overflow-x-hidden box-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
