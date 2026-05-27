import type { Env } from "@motoboy/types";

export function isEvolutionConfigured(env: Env): boolean {
  return Boolean(
    env.EVOLUTION_API_URL?.trim() &&
      env.EVOLUTION_API_KEY?.trim() &&
      env.EVOLUTION_INSTANCE?.trim(),
  );
}

/** Sem Evolution configurado → cadastro/login sem código (padrão). */
export function isSkipAuthCodeEnabled(env: Env): boolean {
  const flag = process.env.ALLOW_SKIP_AUTH_CODE?.trim().toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return !isEvolutionConfigured(env);
}
