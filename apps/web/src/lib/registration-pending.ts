const KEY = "motocopiloto_registration_pending_v1";

export type PendingRegistration = {
  name: string;
  email: string;
  phone: string;
};

export function savePendingRegistration(data: PendingRegistration): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function readPendingRegistration(): PendingRegistration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRegistration;
    if (!parsed.name?.trim() || !parsed.email?.trim() || !parsed.phone) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingRegistration(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
