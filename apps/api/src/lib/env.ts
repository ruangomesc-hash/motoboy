import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { envSchema, type Env } from "@motoboy/types";
import { assertProductionSecurity } from "./runtime-env.js";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../../.env"),
];

for (const file of envCandidates) {
  if (existsSync(file)) {
    config({ path: file });
  }
}

if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

export function loadEnv(): Env {
  const isProd =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
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
