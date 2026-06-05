const STORAGE_KEY = "motoboy:pix-checkout:v1";
const MAX_AGE_MS = 30 * 60 * 1000;

export type PixCheckoutSession = {
  chargeId: string;
  amount?: number;
  pixCopyPaste?: string | null;
  pixQrCodeImage?: string | null;
  updatedAt: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readPixCheckoutSession(): PixCheckoutSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PixCheckoutSession;
    if (!parsed?.chargeId?.trim()) return null;
    if (Date.now() - (parsed.updatedAt ?? 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writePixCheckoutSession(data: PixCheckoutSession): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, updatedAt: Date.now() }),
    );
  } catch {
    /* quota / modo privado */
  }
}

export function clearPixCheckoutSession(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
