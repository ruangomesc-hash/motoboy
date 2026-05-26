/** URL base da API (browser, SSR e Vercel serverless no mesmo domínio). */
export function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

  // Dev local: API em outra porta (rewrite no next.config).
  if (process.env.API_URL?.trim()) {
    return process.env.API_URL.replace(/\/$/, "");
  }

  // Produção: mesmo domínio do app (APP_URL / NEXTAUTH_URL / VERCEL_URL).
  const origin = resolveAppOrigin();
  return `${origin.replace(/\/$/, "")}/api/backend`;
}

/** URL pública do app (links de afiliado, redirects). */
export function resolveAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.APP_URL?.trim()) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3002";
}
