#!/usr/bin/env node
/**
 * Build Vercel: Prisma (binary + rhel) → types → Next.js.
 * Tabelas: `bash scripts/setup-supabase.sh` no Mac após o primeiro deploy.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webDir = resolve(root, "apps/web");

console.log("\n[vercel-build] v7 — Prisma + migrations + Next (sync entregas)\n");

function hasRealDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  return (
    url.length > 24 &&
    !url.includes("build:build@127.0.0.1") &&
    !url.includes("placeholder")
  );
}

function ensureEnv(name, fallback) {
  if (!process.env[name]?.trim()) {
    process.env[name] = fallback;
    console.log(
      `[vercel-build] ${name} → placeholder (defina na Vercel para runtime)`,
    );
  }
}

const vercelHost = process.env.VERCEL_URL?.trim();
const appOrigin = vercelHost
  ? `https://${vercelHost}`
  : "https://placeholder.vercel.app";

ensureEnv(
  "DATABASE_URL",
  "postgresql://build:build@127.0.0.1:5432/postgres?schema=public",
);
ensureEnv("DIRECT_URL", process.env.DATABASE_URL);
ensureEnv("NEXTAUTH_URL", appOrigin);
ensureEnv("APP_URL", appOrigin);
ensureEnv("NEXT_PUBLIC_APP_URL", appOrigin);
ensureEnv("NEXTAUTH_SECRET", "vercel-build-nextauth-secret-32chars!!");
ensureEnv("JWT_SECRET", "vercel-build-jwt-secret-min-16-chars!!");

process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = "binary";

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, {
      stdio: "inherit",
      cwd: opts.cwd ?? root,
      env: {
        ...process.env,
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=6144",
      },
    });
  } catch {
    console.error(`\n[vercel-build] FALHOU: ${cmd}\n`);
    process.exit(1);
  }
}

function extractCommandErrorOutput(error) {
  const out =
    error && typeof error === "object" && "stdout" in error
      ? String(error.stdout ?? "")
      : "";
  const err =
    error && typeof error === "object" && "stderr" in error
      ? String(error.stderr ?? "")
      : "";
  return `${out}\n${err}`;
}

function runDbDeployWithRecovery() {
  const deployCmd = "pnpm db:deploy";
  console.log(`\n> ${deployCmd}`);
  try {
    const output = execSync(deployCmd, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: root,
      env: {
        ...process.env,
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=6144",
      },
    });
    if (output?.trim()) process.stdout.write(output);
    return;
  } catch (error) {
    const output = extractCommandErrorOutput(error);
    if (output.trim()) process.stderr.write(output);
    const failedMigration = "20260527190000_costs_configured_at";
    const shouldRecover =
      output.includes("Error: P3009") && output.includes(failedMigration);
    if (!shouldRecover) {
      console.error(`\n[vercel-build] FALHOU: ${deployCmd}\n`);
      process.exit(1);
    }

    console.warn(
      `\n[vercel-build] Detectado P3009 na migration ${failedMigration}. Tentando recuperação automática...\n`,
    );
    run(
      `pnpm --filter @motoboy/db exec prisma migrate resolve --rolled-back ${failedMigration}`,
    );
    run(deployCmd);
  }
}

run(
  "pnpm --filter @motoboy/db exec prisma generate --schema=./prisma/schema.prisma",
);

if (hasRealDatabase()) {
  console.log("\n[vercel-build] Supabase detectado — aplicando migrations…\n");
  runDbDeployWithRecovery();
} else {
  console.warn(
    "\n[vercel-build] AVISO: migrations NÃO rodaram (DATABASE_URL de placeholder).\n" +
      "         Na Vercel: marque DATABASE_URL e DIRECT_URL em Production + Build.\n",
  );
}

run("pnpm exec next build", { cwd: webDir });

const engineHints = [
  resolve(root, "node_modules/.prisma/client"),
  resolve(root, "node_modules/@prisma/client"),
];
const hasEngine = engineHints.some((p) => existsSync(p));
if (!hasEngine) {
  console.warn(
    "[vercel-build] AVISO: pasta .prisma/client não encontrada na raiz — confira pnpm install",
  );
} else {
  console.log("[vercel-build] Prisma client gerado OK");
}

console.log("\n[vercel-build] OK\n");
