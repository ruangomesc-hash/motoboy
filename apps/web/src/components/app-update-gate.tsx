"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  APP_RELEASE_ID,
  acknowledgeRelease,
  clearBrowserLocalStorageCaches,
  needsReleaseRefresh,
} from "@/lib/app-release";

export function AppUpdateGate() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (needsReleaseRefresh()) setOpen(true);
  }, [status]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function applyUpdate() {
    setApplying(true);
    const userId =
      session?.user && "id" in session.user
        ? (session.user as { id?: string }).id
        : undefined;
    clearBrowserLocalStorageCaches(userId ?? null);
    acknowledgeRelease(APP_RELEASE_ID);
    window.location.reload();
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div className="space-y-2">
          <h2 id="app-update-title" className="text-lg font-semibold">
            Nova atualização
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Atualizamos o cálculo de lucro: só entram custos que você registra
            (abastecimento no Zap ou despesas manuais). Toque abaixo para apagar
            só o que ficou guardado neste celular/navegador. Suas entregas e dados
            no servidor não são apagados.
          </p>
        </div>
        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={applying}
          onClick={() => void applyUpdate()}
        >
          {applying ? "Atualizando..." : "Atualizar agora"}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
