import { isIosDevice } from "@/lib/pwa-install";

export type InstallBrowserKind =
  | "ios"
  | "android-chrome"
  | "android-samsung"
  | "android-firefox"
  | "android-edge"
  | "android-opera"
  | "android-other"
  | "other-mobile";

export type PwaInstallGuide = {
  browserLabel: string;
  steps: string[];
  /** Botão nativo do navegador (Chrome/Edge Android, desktop Chrome). */
  supportsNativePrompt: boolean;
};

/** Logo circular do Motocopiloto (mesmo do perfil / marca) — public/icons/app-icon.png */
export const PWA_BRAND_ICON = "/icons/app-icon.png";
export const PWA_HOME_SCREEN_ICON = "/icons/icon-512.png";
export const PWA_HOME_SCREEN_ICON_SMALL = "/icons/icon-192.png";
export const PWA_APPLE_TOUCH_ICON = "/icons/apple-touch-icon.png";

export function detectInstallBrowser(): InstallBrowserKind {
  if (typeof navigator === "undefined") return "other-mobile";
  const ua = navigator.userAgent;

  if (isIosDevice()) return "ios";

  if (/android/i.test(ua)) {
    if (/SamsungBrowser/i.test(ua)) return "android-samsung";
    if (/Firefox/i.test(ua)) return "android-firefox";
    if (/EdgA|EdgiOS/i.test(ua)) return "android-edge";
    if (/OPR|Opera/i.test(ua)) return "android-opera";
    if (/Chrome/i.test(ua)) return "android-chrome";
    return "android-other";
  }

  return "other-mobile";
}

const GUIDES: Record<InstallBrowserKind, PwaInstallGuide> = {
  ios: {
    browserLabel: "iPhone / iPad (Safari, Chrome, Edge, Firefox e outros)",
    supportsNativePrompt: false,
    steps: [
      "Toque no botão Compartilhar (quadrado com seta para cima) na barra do navegador.",
      "Role o menu e toque em Adicionar à Tela de Início (ou “Adicionar ao ecrã principal”).",
      "Confirme em Adicionar. O ícone do Motocopiloto aparecerá na tela inicial.",
    ],
  },
  "android-chrome": {
    browserLabel: "Chrome no Android",
    supportsNativePrompt: true,
    steps: [
      "Se aparecer o botão Instalar atalho abaixo, use-o.",
      "Senão: menu ⋮ (três pontos) → Instalar app ou Adicionar à tela inicial.",
      "Confirme a instalação. O app abre em tela cheia, sem barra do navegador.",
    ],
  },
  "android-samsung": {
    browserLabel: "Samsung Internet",
    supportsNativePrompt: false,
    steps: [
      "Toque no menu ≡ ou ⋮ do navegador.",
      "Escolha Adicionar página a → Tela inicial (ou Instalar aplicativo).",
      "Confirme. O atalho ficará na tela inicial com o ícone do Motocopiloto.",
    ],
  },
  "android-firefox": {
    browserLabel: "Firefox no Android",
    supportsNativePrompt: false,
    steps: [
      "Toque no menu ⋮ (três pontos).",
      "Toque em Instalar ou Adicionar à tela inicial.",
      "Confirme para criar o atalho do app.",
    ],
  },
  "android-edge": {
    browserLabel: "Microsoft Edge no Android",
    supportsNativePrompt: true,
    steps: [
      "Se o botão Instalar atalho aparecer, use-o.",
      "Senão: menu ⋯ → Adicionar ao telefone → Instalar aplicativo.",
      "Confirme na tela seguinte.",
    ],
  },
  "android-opera": {
    browserLabel: "Opera no Android",
    supportsNativePrompt: false,
    steps: [
      "Toque no menu do Opera (ícone de perfil ou ⋮).",
      "Escolha Página inicial → Adicionar à tela inicial, ou Instalar.",
      "Confirme o atalho.",
    ],
  },
  "android-other": {
    browserLabel: "Navegador no Android",
    supportsNativePrompt: false,
    steps: [
      "Abra o menu do navegador (⋮ ou ≡).",
      "Procure Instalar app, Adicionar à tela inicial ou Atalho.",
      "Confirme. O nome do atalho será Motocopiloto.",
    ],
  },
  "other-mobile": {
    browserLabel: "Navegador no celular",
    supportsNativePrompt: false,
    steps: [
      "No menu do navegador, procure Instalar app ou Adicionar à tela inicial.",
      "No iPhone, use sempre Compartilhar → Adicionar à Tela de Início.",
      "Confirme para abrir o Motocopiloto direto da tela inicial.",
    ],
  },
};

export function getPwaInstallGuide(kind = detectInstallBrowser()): PwaInstallGuide {
  return GUIDES[kind];
}
