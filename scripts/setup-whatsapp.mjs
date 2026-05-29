#!/usr/bin/env node
/**
 * Deixa Evolution + instância + webhook prontos; você só escaneia o QR.
 *
 * Uso:
 *   pnpm whatsapp:setup          # sobe Evolution no Docker + configura
 *   pnpm whatsapp:setup --qr-only  # só QR (Evolution já rodando)
 *
 * Produção (Evolution em VPS com URL pública):
 *   EVOLUTION_API_URL=https://evo.seudominio.com pnpm whatsapp:setup --qr-only
 */
import { execSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const qrOnly = args.has("--qr-only");

const APP_URL =
  process.env.APP_URL?.trim() || "https://app.motocopiloto.com.br";
const INSTANCE = process.env.EVOLUTION_INSTANCE?.trim() || "motoboy";
const WEBHOOK_PATH = "/api/backend/webhooks/whatsapp";

function log(msg) {
  console.log(msg);
}

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function readEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return { path: envPath, text: "", map: new Map() };
  const text = fs.readFileSync(envPath, "utf8");
  const map = new Map();
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return { path: envPath, text, map };
}

function ensureEnvKey(env, key, value) {
  if (env.map.get(key)?.trim()) return env;
  const line = `${key}=${value}\n`;
  env.text = env.text.endsWith("\n") || env.text === ""
    ? env.text + line
    : `${env.text}\n${line}`;
  env.map.set(key, value);
  return env;
}

function writeEnvFile(env) {
  fs.writeFileSync(env.path, env.text);
}

function dockerAvailable() {
  try {
    execSync("docker compose version", { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync("docker-compose version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}

function composeUpEvolution() {
  if (!dockerAvailable()) {
    die("Docker não encontrado. Instale Docker Desktop ou use Evolution em uma VPS.");
  }
  log("🐳 Subindo Evolution API (porta 8080)...");
  const r = spawnSync(
    "docker",
    ["compose", "up", "-d", "evolution-api", "redis"],
    { cwd: root, stdio: "inherit" },
  );
  if (r.status !== 0) die("Falha ao subir docker compose.");
}

async function waitEvolution(baseUrl, apiKey, maxSec = 90) {
  const start = Date.now();
  while (Date.now() - start < maxSec * 1000) {
    try {
      const res = await fetch(`${baseUrl}/`, {
        headers: { apikey: apiKey },
      });
      if (res.ok || res.status === 404) return;
    } catch {
      /* aguardando */
    }
    await new Promise((r) => setTimeout(r, 2000));
    process.stdout.write(".");
  }
  console.log("");
  die(`Evolution não respondeu em ${maxSec}s em ${baseUrl}`);
}

async function api(baseUrl, apiKey, method, route, body) {
  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function ensureInstance(baseUrl, apiKey) {
  const list = await api(baseUrl, apiKey, "GET", "/instance/fetchInstances");
  const instances = Array.isArray(list.json)
    ? list.json
    : list.json?.instances ?? [];
  const exists = instances.some(
    (i) =>
      (i.instanceName ?? i.name ?? i.instance?.instanceName) === INSTANCE,
  );
  if (exists) {
    log(`ℹ️  Instância "${INSTANCE}" já existe.`);
    return;
  }
  log(`📦 Criando instância "${INSTANCE}"...`);
  const created = await api(baseUrl, apiKey, "POST", "/instance/create", {
    instanceName: INSTANCE,
    integration: "WHATSAPP-BAILEYS",
    qrcode: true,
  });
  if (!created.ok && created.status !== 403) {
    log(`   Resposta create (${created.status}): ${JSON.stringify(created.json).slice(0, 200)}`);
  }
}

async function setWebhook(baseUrl, apiKey, webhookUrl, secret) {
  log(`🔗 Webhook → ${webhookUrl}`);
  const body = {
    enabled: true,
    url: webhookUrl,
    webhookByEvents: false,
    webhookBase64: false,
    headers: { apikey: secret },
    events: ["MESSAGES_UPSERT"],
  };
  const res = await api(
    baseUrl,
    apiKey,
    "POST",
    `/webhook/set/${INSTANCE}`,
    body,
  );
  if (!res.ok) {
    log(`⚠️  Webhook set retornou ${res.status} — configure manualmente no painel Evolution.`);
  }
}

async function fetchQr(baseUrl, apiKey) {
  const res = await api(
    baseUrl,
    apiKey,
    "GET",
    `/instance/connect/${INSTANCE}`,
  );
  return res.json;
}

function saveQrHtml(payload) {
  const b64 =
    payload?.base64 ??
    payload?.qrcode?.base64 ??
    payload?.code ??
    null;
  if (!b64 || typeof b64 !== "string") return false;
  const src = b64.startsWith("data:")
    ? b64
    : `data:image/png;base64,${b64.replace(/^data:image\/\w+;base64,/, "")}`;
  const out = path.join(root, "whatsapp-qrcode.html");
  fs.writeFileSync(
    out,
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR WhatsApp Motocopiloto</title></head><body style="font-family:sans-serif;text-align:center;padding:2rem"><h1>Escaneie no WhatsApp</h1><p>WhatsApp → Aparelhos conectados → Conectar</p><img src="${src}" alt="QR" style="max-width:320px"/><p>Atualize esta página se o QR expirar.</p></body></html>`,
  );
  return out;
}

function printVercelBlock(apiKey, webhookSecret, evolutionUrl) {
  log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Cole na Vercel (Settings → Environment Variables):

EVOLUTION_API_URL=${evolutionUrl}
EVOLUTION_API_KEY=${apiKey}
EVOLUTION_INSTANCE=${INSTANCE}
EVOLUTION_WEBHOOK_SECRET=${webhookSecret}
EVOLUTION_BOT_NUMBER=55SEU_DDD_NUMERO
REDIS_URL=rediss://... (Upstash)
RUN_WHATSAPP_WORKER=false
OPENAI_API_KEY=sk-...

NEXT_PUBLIC_EVOLUTION_BOT_NUMBER=55SEU_DDD_NUMERO

Worker (Railway/Render) — mesmas vars + RUN_WHATSAPP_WORKER=true
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

async function main() {
  log("\n🛵 Motocopiloto — setup WhatsApp (Evolution)\n");

  let env = readEnvFile();
  const apiKey =
    process.env.EVOLUTION_API_KEY?.trim() ||
    env.map.get("EVOLUTION_API_KEY")?.trim() ||
    crypto.randomBytes(16).toString("hex");
  const webhookSecret =
    process.env.EVOLUTION_WEBHOOK_SECRET?.trim() ||
    env.map.get("EVOLUTION_WEBHOOK_SECRET")?.trim() ||
    crypto.randomBytes(16).toString("hex");

  env = ensureEnvKey(env, "EVOLUTION_API_KEY", apiKey);
  env = ensureEnvKey(env, "EVOLUTION_WEBHOOK_SECRET", webhookSecret);
  env = ensureEnvKey(env, "EVOLUTION_INSTANCE", INSTANCE);
  if (!env.map.get("REDIS_URL")?.trim()) {
    env = ensureEnvKey(env, "REDIS_URL", "redis://localhost:6379");
  }
  if (!env.map.get("RUN_WHATSAPP_WORKER")?.trim()) {
    env = ensureEnvKey(env, "RUN_WHATSAPP_WORKER", "true");
  }

  let evolutionUrl =
    process.env.EVOLUTION_API_URL?.trim() ||
    env.map.get("EVOLUTION_API_URL")?.trim() ||
    "http://localhost:8080";

  if (!qrOnly) {
    env = ensureEnvKey(env, "EVOLUTION_API_URL", evolutionUrl);
    writeEnvFile(env);
    composeUpEvolution();
    evolutionUrl = "http://localhost:8080";
  } else {
    writeEnvFile(env);
  }

  log(`⏳ Aguardando Evolution em ${evolutionUrl} ...`);
  await waitEvolution(evolutionUrl, apiKey);

  await ensureInstance(evolutionUrl, apiKey);

  const webhookUrl = `${APP_URL.replace(/\/$/, "")}${WEBHOOK_PATH}`;
  await setWebhook(evolutionUrl, apiKey, webhookUrl, webhookSecret);

  env = ensureEnvKey(env, "EVOLUTION_API_URL", evolutionUrl);
  writeEnvFile(env);

  log("\n📱 Gerando QR...");
  const qrPayload = await fetchQr(evolutionUrl, apiKey);
  const htmlPath = saveQrHtml(qrPayload);

  const managerUrl = `${evolutionUrl.replace(/\/$/, "")}/manager`;
  log(`
✅ Pronto para escanear!

   1. Abra no navegador:
      ${managerUrl}
      ${htmlPath ? `   ou: file://${htmlPath}` : ""}

   2. WhatsApp no celular → Aparelhos conectados → Conectar aparelho → escaneie o QR

   3. Com API + worker rodando, teste: "R$ 30 entrega teste"
      (mesmo número cadastrado no app)

⚠️  Limites (não dá para eu fazer por você):
   • Escanear o QR — só no seu celular
   • Redis na Vercel (Upstash) + worker no Railway — senão webhook enfileira e não processa
   • Evolution em produção precisa de URL pública (VPS/Railway), não roda na Vercel
`);

  printVercelBlock(apiKey, webhookSecret, evolutionUrl);

  if (!qrOnly && evolutionUrl.startsWith("http://localhost")) {
    log(`💡 Local: em outro terminal rode:
   pnpm dev:api   (com RUN_WHATSAPP_WORKER=true no .env)
   pnpm dev:web
`);
  }
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)));
