#!/usr/bin/env node
/**
 * Build de produção (Vercel): Prisma generate, pacotes internos, Next.js.
 * Migrations no Supabase: rode uma vez no Mac com `pnpm db:deploy` (veja PUBLICAR.md).
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

if (!process.env.NEXTAUTH_URL?.trim() && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  console.log(`[vercel-build] NEXTAUTH_URL → ${process.env.NEXTAUTH_URL}`);
}

if (!process.env.APP_URL?.trim()) {
  process.env.APP_URL =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
}

run("pnpm db:generate");
run("pnpm --filter @motocheck/types build");

const shouldMigrate =
  process.env.RUN_DB_MIGRATE === "1" &&
  process.env.DATABASE_URL?.trim() &&
  process.env.DIRECT_URL?.trim();

if (shouldMigrate) {
  const migrationsDir = resolve(
    root,
    "packages/db/prisma/migrations/20260526120000_init",
  );
  if (existsSync(migrationsDir)) {
    try {
      run("pnpm db:deploy");
    } catch {
      console.warn("[vercel-build] migrate deploy falhou — tentando db:push...");
      run("pnpm db:push --accept-data-loss");
    }
  } else {
    run("pnpm db:push");
  }
} else if (process.env.VERCEL === "1") {
  console.log(
    "\n[vercel-build] Migrations omitidas no deploy Vercel (padrão).\n",
    "  Se o banco estiver vazio, no Mac (com DATABASE_URL e DIRECT_URL no .env):\n",
    "    pnpm db:deploy\n",
  );
}

run("pnpm --filter @motocheck/web build");

console.log("\n[vercel-build] Concluído.\n");
