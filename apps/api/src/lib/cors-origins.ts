import type { Env } from "@motoboy/types";

function normalizeOrigin(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProto);
    return url.origin;
  } catch {
    return null;
  }
}

function hostFromOrigin(origin: string): string | null {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

/** Origens explícitas a partir de variáveis de ambiente do deploy. */
export function collectCorsOrigins(env: Env): Set<string> {
  const origins = new Set<string>([
    "http://localhost:3002",
    "http://localhost:3003",
  ]);

  const candidates = [
    env.APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : undefined,
  ];

  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    const origin = normalizeOrigin(raw);
    if (origin) origins.add(origin);
  }

  return origins;
}

/**
 * Aceita origem do browser quando bate com env, domínio customizado do produto
 * ou preview *.vercel.app (mesmo projeto).
 */
export function isCorsOriginAllowed(
  origin: string,
  allowedOrigins: Set<string>,
): boolean {
  if (allowedOrigins.has(origin)) return true;

  const host = hostFromOrigin(origin);
  if (!host) return false;

  const allowedHosts = new Set<string>();
  for (const o of allowedOrigins) {
    const h = hostFromOrigin(o);
    if (h) allowedHosts.add(h);
  }
  if (allowedHosts.has(host)) return true;

  if (host.endsWith(".vercel.app") && [...allowedHosts].some((h) => h.endsWith(".vercel.app"))) {
    return true;
  }

  if (host === "app.motocopiloto.com.br" || host.endsWith(".motocopiloto.com.br")) {
    return true;
  }

  if (host === "localhost" || host === "127.0.0.1") {
    return true;
  }

  return false;
}
