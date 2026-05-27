import type { Env } from "@motoboy/types";
import { isProductionRuntime } from "./runtime-env.js";

export function isEvolutionConfigured(env: Env): boolean {
  return Boolean(
    env.EVOLUTION_API_URL?.trim() &&
      env.EVOLUTION_API_KEY?.trim() &&
      env.EVOLUTION_INSTANCE?.trim(),
  );
}

/**
 * Pular OTP só em desenvolvimento ou com flag explícita.
 * Em produção o padrão é false (fail-closed).
 */
export function isSkipAuthCodeEnabled(env: Env): boolean {
  const force = process.env.ALLOW_SKIP_AUTH_CODE?.trim().toLowerCase();
  if (force === "false") return false;
  if (force === "true") {
    if (isProductionRuntime()) {
      return false;
    }
    return true;
  }
  if (isProductionRuntime()) return false;
  return !isEvolutionConfigured(env);
}
