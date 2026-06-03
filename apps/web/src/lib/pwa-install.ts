const DISMISS_KEY = "motocopiloto_pwa_install_dismiss_v1";

export type PwaInstallDismissReason = "later" | "installed";

type DismissRecord = {
  reason: PwaInstallDismissReason;
  until: number;
};

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/android|iphone|ipad|ipod|mobile/i.test(ua)) return true;
  return navigator.maxTouchPoints > 1 && window.innerWidth < 900;
}

/** iPhone/iPad — instalação é sempre via Compartilhar → Tela de Início. */
export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function readDismiss(): DismissRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DismissRecord;
    if (!parsed?.until || !parsed.reason) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function dismissPwaInstallPrompt(reason: PwaInstallDismissReason): void {
  if (typeof window === "undefined") return;
  const days = reason === "installed" ? 3650 : 14;
  const record: DismissRecord = {
    reason,
    until: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(DISMISS_KEY, JSON.stringify(record));
}

export function shouldShowPwaInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneDisplay()) return false;
  if (!isMobileBrowser()) return false;

  const dismissed = readDismiss();
  if (dismissed && dismissed.until > Date.now()) return false;

  return true;
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof (event as BeforeInstallPromptEvent).prompt === "function"
  );
}
