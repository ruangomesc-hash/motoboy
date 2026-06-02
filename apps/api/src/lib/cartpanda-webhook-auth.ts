import type { Env } from "@motoboy/types";

/** Valida webhook CartPanda (token opcional no header ou query). */
export function verifyCartpandaWebhook(
  env: Env,
  headers: Record<string, string | string[] | undefined>,
  query?: Record<string, string | undefined>,
): boolean {
  const secret = env.CARTPANDA_WEBHOOK_SECRET?.trim();
  if (!secret) return true;

  const candidates = [
    headers["x-webhook-secret"],
    headers["x-cartpanda-token"],
    headers["authorization"],
    query?.token,
    query?.secret,
  ];

  for (const raw of candidates) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) continue;
    const token = value.startsWith("Bearer ")
      ? value.slice(7).trim()
      : value.trim();
    if (token === secret) return true;
  }
  return false;
}
