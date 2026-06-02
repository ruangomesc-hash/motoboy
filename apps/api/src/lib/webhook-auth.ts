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

/** Todos os segredos válidos (Vercel pode ter WEBHOOK_SECRET ≠ API_KEY). */
export function evolutionWebhookSecrets(env: Env): string[] {
  const list = [
    process.env.EVOLUTION_WEBHOOK_SECRET?.trim(),
    env.EVOLUTION_WEBHOOK_SECRET?.trim(),
    env.EVOLUTION_API_KEY?.trim(),
  ].filter((v): v is string => Boolean(v));
  return [...new Set(list)];
}

function providedWebhookSecret(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
  return (
    headerValue(headers, "apikey") ??
    headerValue(headers, "x-api-key") ??
    headerValue(headers, "x-webhook-secret") ??
    headerValue(headers, "x-evolution-webhook-secret") ??
    headerValue(headers, "authorization")?.replace(/^Bearer\s+/i, "")
  );
}

/** Evolution: header apikey deve bater com WEBHOOK_SECRET e/ou API_KEY. */
export function verifyEvolutionWebhook(
  env: Env,
  headers: Record<string, string | string[] | undefined>,
): boolean {
  const secrets = evolutionWebhookSecrets(env);
  if (!secrets.length) {
    return !isProductionRuntime();
  }
  const provided = providedWebhookSecret(headers);
  return Boolean(provided && secrets.includes(provided));
}

export function verifyEvolutionWebhookQuery(
  env: Env,
  query: Record<string, unknown> | undefined,
): boolean {
  const secrets = evolutionWebhookSecrets(env);
  if (!secrets.length) return !isProductionRuntime();
  const q = query?.apikey ?? query?.apiKey ?? query?.token;
  const provided = Array.isArray(q) ? q[0] : q;
  return typeof provided === "string" && secrets.includes(provided);
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
