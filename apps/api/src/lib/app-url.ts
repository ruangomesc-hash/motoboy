import type { Env } from "@motoboy/types";

/** Garante origem com protocolo (https em produção). */
export function normalizeAppOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "http://localhost:3002";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * URL pública do app para links e webhook.
 * Prioriza NEXTAUTH_URL / domínio customizado sobre APP_URL legado (.vercel.app).
 */
export function resolvePublicAppUrl(env: Env): string {
  const candidates = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter((v): v is string => Boolean(v?.trim()));

  for (const raw of candidates) {
    const origin = normalizeAppOrigin(raw);
    if (origin.includes("motocopiloto.com.br")) {
      return origin;
    }
  }

  for (const raw of candidates) {
    return normalizeAppOrigin(raw);
  }

  return normalizeAppOrigin(env.APP_URL);
}

export function whatsappWebhookUrl(origin: string): string {
  return `${normalizeAppOrigin(origin)}/api/backend/webhooks/whatsapp`;
}

export function webhookUrlsMatch(a: string, b: string): boolean {
  try {
    const left = new URL(a.includes("://") ? a : `https://${a}`);
    const right = new URL(b.includes("://") ? b : `https://${b}`);
    return (
      left.hostname === right.hostname &&
      left.pathname.replace(/\/$/, "") === right.pathname.replace(/\/$/, "")
    );
  } catch {
    return a.replace(/\/$/, "") === b.replace(/\/$/, "");
  }
}
