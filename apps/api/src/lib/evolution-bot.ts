import type { Env } from "@motoboy/types";
import { resolveEvolutionBotPhoneKeys } from "./evolution-contact.js";

/** Linha Motocopiloto em produção (instância `motoboy`) — só fallback se env ausente. */
const MOTOBOT_INSTANCE_DEFAULT_BOT = "5531992907578";

/**
 * Chaves do número que RECEBE no Evolution (não é o motoboy cadastrado).
 * Usa EVOLUTION_BOT_NUMBER; se vazio e instância motoboy, fallback documentado.
 */
export function getEvolutionBotPhoneKeys(env: Pick<Env, "EVOLUTION_BOT_NUMBER" | "EVOLUTION_INSTANCE">): Set<string> {
  const explicit = env.EVOLUTION_BOT_NUMBER?.trim();
  if (explicit) return resolveEvolutionBotPhoneKeys(explicit);

  const instance = env.EVOLUTION_INSTANCE?.trim();
  if (instance === "motoboy") {
    return resolveEvolutionBotPhoneKeys(MOTOBOT_INSTANCE_DEFAULT_BOT);
  }

  return new Set();
}
