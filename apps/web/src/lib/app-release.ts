import { APP_SYNC_BRIDGE_KEY } from "@/lib/app-sync";
import { clearAppCache } from "@/lib/app-persist-cache";

/** Bump ao mudar lógica do app — força popup de limpeza só no navegador. */
export const APP_RELEASE_ID = "2026-06-03-custos-manuais";

const ACK_KEY = "motocopiloto_app_release_ack_v1";

export function getAcknowledgedRelease(): string | null {
  if (typeof window === "undefined") return APP_RELEASE_ID;
  return localStorage.getItem(ACK_KEY);
}

export function acknowledgeRelease(releaseId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACK_KEY, releaseId);
}

export function needsReleaseRefresh(): boolean {
  if (typeof window === "undefined") return false;
  return getAcknowledgedRelease() !== APP_RELEASE_ID;
}

/**
 * Apaga apenas dados guardados neste navegador/celular (localStorage).
 * Não chama API e não altera nada no servidor (banco, sessão remota, etc.).
 */
export function clearBrowserLocalStorageCaches(userId?: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) clearAppCache(userId);

  const removeKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (
      key.startsWith("motocopiloto_") ||
      key === APP_SYNC_BRIDGE_KEY ||
      key.startsWith("motoboy:")
    ) {
      removeKeys.push(key);
    }
  }
  for (const key of removeKeys) {
    localStorage.removeItem(key);
  }
}
