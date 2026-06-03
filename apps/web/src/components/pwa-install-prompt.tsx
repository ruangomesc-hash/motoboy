"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { needsReleaseRefresh } from "@/lib/app-release";
import {
  detectInstallBrowser,
  getPwaInstallGuide,
  PWA_BRAND_ICON,
} from "@/lib/pwa-install-guide";
import {
  dismissPwaInstallPrompt,
  isBeforeInstallPromptEvent,
  isStandaloneDisplay,
  shouldShowPwaInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";
import { Download, Smartphone } from "lucide-react";

export function PwaInstallPrompt() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const browserKind = mounted ? detectInstallBrowser() : "other-mobile";
  const guide = useMemo(() => getPwaInstallGuide(browserKind), [browserKind]);
  const showNativeButton =
    canNativeInstall && guide.supportsNativePrompt;

  useEffect(() => {
    setMounted(true);
  }, []);

  const evaluateOpen = useCallback(() => {
    if (status !== "authenticated") return;
    if (isStandaloneDisplay()) return;
    if (needsReleaseRefresh()) return;
    if (shouldShowPwaInstallPrompt()) setOpen(true);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !mounted) return;

    const onBeforeInstall = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) return;
      event.preventDefault();
      deferredPromptRef.current = event;
      setCanNativeInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    const timer = window.setTimeout(evaluateOpen, 3000);
    const poll = window.setInterval(() => {
      if (!needsReleaseRefresh()) {
        evaluateOpen();
        window.clearInterval(poll);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
      window.clearInterval(poll);
    };
  }, [status, mounted, evaluateOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleInstall() {
    const deferred = deferredPromptRef.current;
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        dismissPwaInstallPrompt("installed");
        setOpen(false);
      }
    } catch {
      /* cancelado */
    } finally {
      setInstalling(false);
      deferredPromptRef.current = null;
    }
  }

  function handleLater() {
    dismissPwaInstallPrompt("later");
    setOpen(false);
  }

  function handleAlreadyInstalled() {
    dismissPwaInstallPrompt("installed");
    setOpen(false);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[240] flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-emerald-500/30 bg-[#0a0a0a]">
            <Image
              src={PWA_BRAND_ICON}
              alt="Ícone Motocopiloto"
              width={56}
              height={56}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div className="space-y-2 min-w-0 flex-1">
            <h2 id="pwa-install-title" className="text-lg font-semibold leading-tight">
              Instalar no celular
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mesmo ícone do app na tela inicial — abre direto, sem procurar no
              navegador.
            </p>
            <p className="text-[11px] text-muted-foreground/90">
              {guide.browserLabel}
            </p>
          </div>
        </div>

        {showNativeButton && (
          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={installing}
            onClick={() => void handleInstall()}
          >
            <Download className="h-4 w-4 mr-2" strokeWidth={2} />
            {installing ? "Abrindo instalação..." : "Instalar atalho"}
          </Button>
        )}

        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="flex flex-col gap-2">
          {browserKind === "ios" && (
            <Button type="button" className="w-full" size="lg" onClick={handleLater}>
              Entendi, vou adicionar
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleLater}
            >
              Agora não
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 text-muted-foreground"
              onClick={handleAlreadyInstalled}
            >
              Já instalei
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
