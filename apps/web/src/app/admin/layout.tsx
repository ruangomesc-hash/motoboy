"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#0a0f0d] text-foreground motoboy-desktop-bg">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh h-dvh overflow-hidden bg-[#0a0f0d] text-foreground">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
