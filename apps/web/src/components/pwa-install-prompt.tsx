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
  dismissPwaInstallForSession,
  dismissPwaInstallPermanently,
  isBeforeInstallPromptEvent,
  isStandaloneDisplay,
  PWA_INSTALL_OPEN_EVENT,
  shouldShowPwaInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";
import { Download, HardDrive } from "lucide-react";

export function PwaInstallPrompt() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [neverShowAgain, setNeverShowAgain] = useState(false);
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

    const onForceOpen = () => {
      if (status !== "authenticated" || isStandaloneDisplay()) return;
      setNeverShowAgain(false);
      setOpen(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener(PWA_INSTALL_OPEN_EVENT, onForceOpen);
    const timer = window.setTimeout(evaluateOpen, 3000);
    const poll = window.setInterval(() => {
      if (!needsReleaseRefresh()) {
        evaluateOpen();
        window.clearInterval(poll);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener(PWA_INSTALL_OPEN_EVENT, onForceOpen);
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

  function closeWithDismissChoice() {
    if (neverShowAgain) dismissPwaInstallPermanently();
    setOpen(false);
  }

  async function handleInstall() {
    const deferred = deferredPromptRef.current;
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        dismissPwaInstallPermanently();
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
    dismissPwaInstallForSession();
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
      <div className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-emerald-500/30 bg-[#0a0a0a]">
            <Image
              src={PWA_BRAND_ICON}
              alt="Ícone Motocopiloto"
              width={56}
              height={56}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h2 id="pwa-install-title" className="text-lg font-semibold leading-tight">
              Instalar no celular
            </h2>
            <p className="text-sm text-muted-foreground leading-snug">
              Atalho na tela inicial — mesmo ícone do Motocopiloto.
            </p>
            <p className="text-[11px] text-muted-foreground/90">
              {guide.browserLabel}
            </p>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground rounded-lg bg-muted/40 px-2.5 py-2">
          <HardDrive className="h-3.5 w-3.5 shrink-0 text-emerald-400/90 mt-0.5" strokeWidth={1.75} />
          <span>
            Não baixa um app pesado nem ocupa memória do celular — é só um atalho
            que abre o site em tela cheia.
          </span>
        </p>

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

        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside leading-snug">
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-border px-3 py-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-emerald-500"
            checked={neverShowAgain}
            onChange={(e) => setNeverShowAgain(e.target.checked)}
          />
          <span className="text-sm leading-snug">
            Já instalei o atalho — não mostrar este aviso de novo
          </span>
        </label>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={closeWithDismissChoice}
          >
            {neverShowAgain ? "Fechar e não mostrar de novo" : "Fechar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleLater}
          >
            Agora não (volta ao abrir o site de novo)
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
