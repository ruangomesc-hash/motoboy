const KEY = "motocopiloto_registration_pending_v1";

export type PendingRegistration = {
  name: string;
  email: string;
  phone: string;
  password: string;
  affiliateCode?: string;
};

export function savePendingRegistration(data: PendingRegistration): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(data));
  sessionStorage.setItem("motoboy-phone", data.phone);
  sessionStorage.setItem("motoboy-name", data.name);
  sessionStorage.setItem("motoboy-email", data.email);
  sessionStorage.setItem("motoboy-auth-mode", "register");
  if (data.affiliateCode?.trim()) {
    sessionStorage.setItem("motoboy-affiliate", data.affiliateCode.trim());
  }
}

export function readPendingRegistration(options?: {
  requirePassword?: boolean;
}): PendingRegistration | null {
  if (typeof window === "undefined") return null;
  const requirePassword = options?.requirePassword !== false;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRegistration;
    if (!parsed.name?.trim() || !parsed.email?.trim() || !parsed.phone) {
      return null;
    }
    if (
      requirePassword &&
      (!parsed.password || parsed.password.length < 8)
    ) {
      return null;
    }
    return {
      name: parsed.name.trim(),
      email: parsed.email.trim(),
      phone: parsed.phone.replace(/\D/g, ""),
      password: parsed.password,
      affiliateCode: parsed.affiliateCode?.trim()
        ? parsed.affiliateCode.trim().toUpperCase()
        : undefined,
    };
  } catch {
    return null;
  }
}

export function clearPendingRegistration(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  sessionStorage.removeItem("motoboy-phone");
  sessionStorage.removeItem("motoboy-name");
  sessionStorage.removeItem("motoboy-email");
  sessionStorage.removeItem("motoboy-auth-mode");
  sessionStorage.removeItem("motoboy-affiliate");
}
