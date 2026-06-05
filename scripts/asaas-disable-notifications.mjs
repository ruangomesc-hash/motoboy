#!/usr/bin/env node
/**
 * Desativa todas as notificações pagas do Asaas (SMS, WhatsApp, ligação, e-mail)
 * para clientes do app — e opcionalmente todos os clientes da conta Asaas.
 *
 * Uso:
 *   node scripts/asaas-disable-notifications.mjs
 *   node scripts/asaas-disable-notifications.mjs --all-asaas
 *
 * Requer ASAAS_API_KEY no .env (ou ambiente). DATABASE_URL para listar clientes do app.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile("railway.env");

const includeAllAsaas = process.argv.includes("--all-asaas");

if (!process.env.ASAAS_API_KEY?.trim()) {
  console.error("ASAAS_API_KEY não configurada (.env ou railway.env).");
  process.exit(1);
}

const runner = `
import { loadEnv } from "../apps/api/src/lib/env.js";
import { disableAsaasNotificationsForAllAppCustomers } from "../apps/api/src/services/asaas-customer-notifications.js";

const env = loadEnv();
const result = await disableAsaasNotificationsForAllAppCustomers(env, undefined, {
  includeAllAsaas: ${includeAllAsaas},
});
console.log(JSON.stringify(result, null, 2));
`;

const tmp = path.join(root, ".tmp-asaas-disable-notifications.mjs");
fs.writeFileSync(tmp, runner);

try {
  execSync(`pnpm exec tsx "${tmp}"`, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
} finally {
  fs.rmSync(tmp, { force: true });
}
