"use client";

import { Monitor } from "lucide-react";
import { useIsAdminDemoMode } from "@/hooks/use-admin-api";

export function AdminDemoBanner() {
  const isDemo = useIsAdminDemoMode();
  if (!isDemo) return null;

  return (
    <div className="mx-4 md:mx-8 mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 flex items-start gap-2 text-sm text-amber-200">
      <Monitor className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.75} />
      <p>
        <strong>Modo preview</strong> — dados de exemplo. API e banco não são
        usados. Para login real, suba a API e use e-mail/senha do{" "}
        <code className="text-xs bg-black/20 px-1 rounded">.env</code>.
      </p>
    </div>
  );
}
