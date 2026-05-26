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
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
];

const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.error(
    "\n[vercel-build] Variáveis obrigatórias ausentes na Vercel:\n",
    missing.map((k) => `  - ${k}`).join("\n"),
    "\n\nVeja DEPLOY.md e vercel.env.example\n",
  );
  process.exit(1);
}

if (!process.env.DIRECT_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.log(
    "[vercel-build] DIRECT_URL não definida — usando DATABASE_URL para migrations.",
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

const migrationsDir = resolve(
  root,
  "packages/db/prisma/migrations/20260526120000_init",
);
if (existsSync(migrationsDir)) {
  run("pnpm db:deploy");
} else {
  console.warn("[vercel-build] Sem migrations — usando db:push");
  run("pnpm db:push");
}

run("pnpm --filter @motocheck/web build");

console.log("\n[vercel-build] Concluído.\n");
