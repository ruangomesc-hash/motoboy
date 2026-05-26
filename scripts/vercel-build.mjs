#!/usr/bin/env node
/**
 * Build Vercel: Prisma generate → types → Next.js.
 * Tabelas: `bash scripts/setup-supabase.sh` no Mac após o deploy.
 */
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webDir = resolve(root, "apps/web");

console.log("\n[vercel-build] v4 — monorepo + Next (sem api tsc)\n");

function ensureEnv(name, fallback) {
  if (!process.env[name]?.trim()) {
    process.env[name] = fallback;
    console.log(`[vercel-build] ${name} → placeholder (defina na Vercel para runtime)`);
  }
}

const vercelHost = process.env.VERCEL_URL?.trim();
const appOrigin = vercelHost ? `https://${vercelHost}` : "https://placeholder.vercel.app";

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

run("pnpm db:generate");
run("pnpm exec next build", { cwd: webDir });

console.log("\n[vercel-build] OK\n");
