import type { Env } from "@motoboy/types";
import { isProductionRuntime } from "./runtime-env.js";

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/** Evolution: secret dedicado ou apikey do painel (header apikey). */
export function verifyEvolutionWebhook(
  env: Env,
  headers: Record<string, string | string[] | undefined>,
): boolean {
  const secret =
    process.env.EVOLUTION_WEBHOOK_SECRET?.trim() ||
    env.EVOLUTION_API_KEY?.trim();
  if (!secret) {
    return !isProductionRuntime();
  }
  const provided =
    headerValue(headers, "apikey") ??
    headerValue(headers, "x-webhook-secret") ??
    headerValue(headers, "x-evolution-webhook-secret");
  return provided === secret;
}

export function verifyAsaasWebhook(
  env: Env,
  headers: Record<string, string | string[] | undefined>,
): boolean {
  const expected = env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (!expected) {
    return !isProductionRuntime();
  }
  const token = headerValue(headers, "asaas-access-token");
  return token === expected;
}
