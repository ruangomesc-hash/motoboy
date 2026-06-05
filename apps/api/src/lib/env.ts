import "./load-dotenv.js";
import { ensureDirectUrlEnv } from "@motoboy/db";
import { envSchema, type Env } from "@motoboy/types";
import {
  assertProductionSecurity,
  isProductionRuntime,
} from "./runtime-env.js";

ensureDirectUrlEnv();

export function loadEnv(): Env {
  const isProd = isProductionRuntime();
  const isNextBuild = process.env.NEXT_PHASE === "phase-production-build";

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    if (isProd) {
      const missing = Object.keys(parsed.error.flatten().fieldErrors);
      throw new Error(
        `Variáveis de ambiente inválidas: ${missing.join(", ")}. Veja DEPLOY.md`,
      );
    }
    console.warn("Env validation warnings:", parsed.error.flatten().fieldErrors);
    return envSchema.parse({
      ...process.env,
      JWT_SECRET:
        process.env.JWT_SECRET ?? "dev-secret-change-in-production-min-16-chars",
    });
  }

  if (isProd && !isNextBuild && !process.env.JWT_SECRET?.trim()) {
    throw new Error("JWT_SECRET é obrigatório em produção.");
  }

  const env = parsed.data;
  if (!isNextBuild) {
    assertProductionSecurity(env);
  }
  return env;
}
