const STORAGE_KEY = "motoboy:card-checkout:v1";
const MAX_AGE_MS = 30 * 60 * 1000;

export type CardCheckoutSession = {
  chargeId: string;
  amount?: number;
  subscriptionId?: string;
  updatedAt: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readCardCheckoutSession(): CardCheckoutSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CardCheckoutSession;
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

export function writeCardCheckoutSession(data: CardCheckoutSession): void {
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

export function clearCardCheckoutSession(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
