import type { Env } from "@motoboy/types";

function isEvolutionConfigured(env: Env): boolean {
  return Boolean(
    env.EVOLUTION_API_URL?.trim() &&
      env.EVOLUTION_API_KEY?.trim() &&
      env.EVOLUTION_INSTANCE?.trim(),
  );
}

export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
  );
}

/** Validações que devem falhar o boot em produção (fail-closed). */
export function assertProductionSecurity(env: Env): void {
  if (!isProductionRuntime()) return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const errors: string[] = [];

  if (!env.JWT_SECRET?.trim() || env.JWT_SECRET.includes("dev-secret")) {
    errors.push("JWT_SECRET fraco ou de desenvolvimento em produção.");
  }

  if (process.env.ALLOW_SKIP_AUTH_CODE?.trim().toLowerCase() === "true") {
    errors.push(
      "ALLOW_SKIP_AUTH_CODE=true em produção desativa OTP — use false.",
    );
  }

  if (isEvolutionConfigured(env) && !process.env.EVOLUTION_WEBHOOK_SECRET?.trim()) {
    errors.push(
      "EVOLUTION_WEBHOOK_SECRET obrigatório quando Evolution está configurado.",
    );
  }

  if (env.ASAAS_API_KEY?.trim() && !env.ASAAS_WEBHOOK_TOKEN?.trim()) {
    errors.push(
      "ASAAS_WEBHOOK_TOKEN obrigatório quando ASAAS_API_KEY está configurado.",
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuração de segurança inválida:\n- ${errors.join("\n- ")}`,
    );
  }
}
