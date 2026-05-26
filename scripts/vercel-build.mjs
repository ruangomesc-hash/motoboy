#!/usr/bin/env node
/**
 * Build de produção (Vercel): gera Prisma, aplica migrations no Supabase, builda o Next.js.
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

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
];

const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.error(
    "\n[vercel-build] Variáveis obrigatórias ausentes na Vercel:\n",
    missing.map((k) => `  - ${k}`).join("\n"),
    "\n\nEm cada variável: marque Production, Preview e **Build** (disponível no build).\n",
    "Veja DEPLOY.md e vercel.env.example\n",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL.includes("6543") && !process.env.DATABASE_URL.includes("pgbouncer")) {
  console.warn(
    "[vercel-build] DATABASE_URL costuma usar o pooler Supabase (porta 6543 + pgbouncer=true).",
  );
}

if (!process.env.DIRECT_URL.includes("5432")) {
  console.warn(
    "[vercel-build] DIRECT_URL costuma usar a porta 5432 (conexão direta) para migrations.",
  );
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
run("pnpm --filter @motocheck/db build");
run("pnpm --filter @motocheck/api build");

const migrationsDir = resolve(
  root,
  "packages/db/prisma/migrations/20260526120000_init",
);
if (existsSync(migrationsDir)) {
  try {
    run("pnpm db:deploy");
  } catch {
    console.error(
      "\n[vercel-build] Falha ao aplicar migrations no Supabase.\n",
      "  1. Confira DATABASE_URL e DIRECT_URL (portas 6543 e 5432).\n",
      "  2. Na Vercel, marque essas variáveis para **Build**.\n",
      "  3. Senha com @ ou ! deve estar codificada (%40, %21).\n",
    );
    process.exit(1);
  }
} else {
  console.warn("[vercel-build] Sem migrations — usando db:push");
  run("pnpm db:push");
}

run("pnpm --filter @motocheck/web build");

console.log("\n[vercel-build] Concluído.\n");
