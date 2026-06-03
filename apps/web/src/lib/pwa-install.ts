const DISMISS_PERMANENT_KEY = "motocopiloto_pwa_install_never_v1";
const DISMISS_SESSION_KEY = "motocopiloto_pwa_install_later_session_v1";

export const PWA_INSTALL_OPEN_EVENT = "motocopiloto:open-pwa-install";

export type PwaInstallDismissReason = "later" | "installed";

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

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/** Não mostrar de novo — já instalou o atalho. */
export function dismissPwaInstallPermanently(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISS_PERMANENT_KEY, "1");
  sessionStorage.removeItem(DISMISS_SESSION_KEY);
}

/** Lembrar mais tarde — só nesta aba/sessão do navegador (some ao fechar o app do browser). */
export function dismissPwaInstallForSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DISMISS_SESSION_KEY, "1");
}

/** @deprecated use dismissPwaInstallPermanently or dismissPwaInstallForSession */
export function dismissPwaInstallPrompt(reason: PwaInstallDismissReason): void {
  if (reason === "installed") dismissPwaInstallPermanently();
  else dismissPwaInstallForSession();
}

export function clearPwaInstallDismiss(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DISMISS_PERMANENT_KEY);
  sessionStorage.removeItem(DISMISS_SESSION_KEY);
  localStorage.removeItem("motocopiloto_pwa_install_dismiss_v1");
}

export function shouldShowPwaInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneDisplay()) return false;
  if (!isMobileBrowser()) return false;
  if (localStorage.getItem(DISMISS_PERMANENT_KEY) === "1") return false;
  if (sessionStorage.getItem(DISMISS_SESSION_KEY) === "1") return false;
  return true;
}

export function openPwaInstallPrompt(): void {
  if (typeof window === "undefined") return;
  clearPwaInstallDismiss();
  window.dispatchEvent(new CustomEvent(PWA_INSTALL_OPEN_EVENT));
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
