const STORAGE_KEY = "motoboy-affiliate-code";

export function normalizeAffiliateCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function readAffiliateFromUrl(
  params: URLSearchParams,
): string | null {
  const raw =
    params.get("cupom") ?? params.get("ref") ?? params.get("affiliate");
  if (!raw?.trim()) return null;
  return normalizeAffiliateCode(raw);
}

export function persistAffiliateCode(code: string): void {
  sessionStorage.setItem(STORAGE_KEY, normalizeAffiliateCode(code));
}

export function readPersistedAffiliateCode(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearPersistedAffiliateCode(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function buildSignupLink(origin: string, code: string): string {
  const base =
    origin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002");
  const url = new URL("/cadastro", base);
  url.searchParams.set("cupom", normalizeAffiliateCode(code));
  return url.toString();
}
