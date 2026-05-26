#!/usr/bin/env node
/**
 * Build Vercel: Prisma generate → types → Next.js.
 * Tabelas no Supabase: rode no Mac `pnpm db:deploy` (com DATABASE_URL e DIRECT_URL no .env).
 */
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

console.log("\n[vercel-build] v3 — generate + types + Next (sem @motocheck/api build)\n");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

// schema.prisma referencia env(); placeholders só para `prisma generate` (sem conexão real)
if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL =
    "postgresql://build:build@127.0.0.1:5432/postgres?schema=public";
}
if (!process.env.DIRECT_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const vercelHost = process.env.VERCEL_URL?.trim();
const appOrigin = vercelHost ? `https://${vercelHost}` : "";

if (!process.env.NEXTAUTH_URL?.trim() && appOrigin) {
  process.env.NEXTAUTH_URL = appOrigin;
}
if (!process.env.APP_URL?.trim() && appOrigin) {
  process.env.APP_URL = appOrigin;
}
if (!process.env.NEXT_PUBLIC_APP_URL?.trim() && appOrigin) {
  process.env.NEXT_PUBLIC_APP_URL = appOrigin;
}

run("pnpm db:generate");
run("pnpm --filter @motocheck/types build");
run("pnpm --filter @motocheck/web build");

console.log("\n[vercel-build] OK — após o deploy, rode `pnpm db:deploy` no Mac se o banco estiver vazio.\n");
