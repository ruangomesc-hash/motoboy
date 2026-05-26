/** URL base da API (browser, SSR e Vercel serverless no mesmo domínio). */
export function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

  if (process.env.API_URL?.trim()) {
    return process.env.API_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/backend`;
  }

  if (process.env.NEXTAUTH_URL?.trim()) {
    return `${process.env.NEXTAUTH_URL.replace(/\/$/, "")}/api/backend`;
  }

  return "http://localhost:3001";
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
