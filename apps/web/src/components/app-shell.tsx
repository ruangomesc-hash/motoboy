"use client";

import { usePathname } from "next/navigation";
import { MobileFrame } from "@/components/mobile-frame";

/** App do motoboy usa o frame de celular; painel admin usa tela cheia. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return <MobileFrame>{children}</MobileFrame>;
}
