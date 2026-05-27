/** URL base da API (browser, SSR e Vercel serverless no mesmo domínio). */
export function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

  // Dev local: API em outra porta (rewrite no next.config).
  if (process.env.API_URL?.trim()) {
    return normalizeOrigin(process.env.API_URL);
  }

  // Produção: mesmo domínio do app (APP_URL / NEXTAUTH_URL / VERCEL_URL).
  const origin = resolveAppOrigin();
  return `${origin.replace(/\/$/, "")}/api/backend`;
}

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Permite variáveis sem protocolo (ex.: motoboy-iota.vercel.app).
  return `https://${trimmed}`;
}

/** URL pública do app (links de afiliado, redirects). */
export function resolveAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.APP_URL?.trim()) {
    return normalizeOrigin(process.env.APP_URL);
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3002";
}
