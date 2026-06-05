#!/usr/bin/env node
/**
 * Aplica migrations no Supabase usando DIRECT_URL derivada do pooler (6543→5432).
 */
import { execSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = resolve(root, "packages/db/prisma/migrations");

/** P3015: pastas sem migration.sql (ex.: rascunho stripe_customer abandonado). */
function cleanupInvalidMigrationDirs() {
  if (!existsSync(migrationsDir)) return;
  for (const name of readdirSync(migrationsDir)) {
    const dir = join(migrationsDir, name);
    if (!statSync(dir).isDirectory()) continue;
    const sql = join(dir, "migration.sql");
    if (existsSync(sql)) continue;
    rmSync(dir, { recursive: true, force: true });
    console.warn(
      `[db-deploy] Removida pasta inválida (sem migration.sql): ${name}`,
    );
  }
}

function loadEnvFile(name) {
  const p = resolve(root, name);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!val) continue;
    const current = process.env[key]?.trim();
    if (!current) process.env[key] = val;
  }
}

function pickDatabaseUrl() {
  const candidates = [
    process.env.DIRECT_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ];
  for (const raw of candidates) {
    const url = raw?.trim();
    if (url && url.length > 12 && !url.includes("127.0.0.1")) return url;
  }
  for (const raw of candidates) {
    const url = raw?.trim();
    if (url && url.length > 12) return url;
  }
  return process.env.DATABASE_URL?.trim() || "";
}

for (const file of [".env.vercel-runtime", ".env", ".env.local"]) {
  loadEnvFile(file);
}

const databaseUrl = pickDatabaseUrl();
if (!databaseUrl) {
  console.error(
    "[db-deploy] DATABASE_URL não definida (.env na raiz ou variáveis Vercel/Supabase)",
  );
  process.exit(1);
}
process.env.DATABASE_URL = databaseUrl;

function deriveDirect(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    if (
      url.port === "6543" ||
      url.hostname.includes(".pooler.") ||
      url.searchParams.get("pgbouncer") === "true"
    ) {
      url.port = "5432";
    }
    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("connection_limit");
    url.searchParams.delete("connect_timeout");
    return url.toString();
  } catch {
    return databaseUrl.replace(":6543/", ":5432/");
  }
}

const migrateUrl = process.env.DIRECT_URL?.trim() || deriveDirect(databaseUrl);
process.env.DIRECT_URL = migrateUrl;
if (databaseUrl.includes("6543") || databaseUrl.includes("pgbouncer=true")) {
  process.env.DATABASE_URL = databaseUrl;
} else {
  process.env.DATABASE_URL = databaseUrl;
}
console.log("[db-deploy] migrate via DIRECT_URL (porta 5432 quando pooler)");

cleanupInvalidMigrationDirs();

execSync(
  "pnpm --filter @motoboy/db exec prisma migrate deploy --schema=./prisma/schema.prisma",
  { stdio: "inherit", cwd: root, env: process.env },
);
