#!/usr/bin/env node
/**
 * Diagnóstico ponta a ponta: Evolution → webhook Vercel → DB → app.
 * Uso: node scripts/diagnose-whatsapp.mjs
 * Lê .env na raiz (não imprime segredos).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  const map = new Map();
  if (!fs.existsSync(envPath)) return map;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) map.set(m[1], m[2].replace(/^["']|["']$/g, ""));
  }
  return map;
}

function envGet(map, key) {
  return process.env[key]?.trim() || map.get(key)?.trim() || "";
}

function maskUrl(url) {
  if (!url) return "(vazio)";
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url.slice(0, 60);
  }
}

async function evolutionFetch(baseUrl, apiKey, route) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${route}`, {
    headers: { apikey: apiKey, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const map = loadEnv();
  const APP_URL = envGet(map, "APP_URL") || "https://app.motocopiloto.com.br";
  const INSTANCE = envGet(map, "EVOLUTION_INSTANCE") || "motoboy";
  let EVOLUTION_API_URL = envGet(map, "EVOLUTION_API_URL");
  if (
    !EVOLUTION_API_URL ||
    /seuservidor|seudominio|evolution-example/i.test(EVOLUTION_API_URL)
  ) {
    EVOLUTION_API_URL = "https://evo.motocopiloto.com.br";
    console.log("   (EVOLUTION_API_URL placeholder → evo.motocopiloto.com.br)\n");
  }
  const EVOLUTION_API_KEY = envGet(map, "EVOLUTION_API_KEY");
  const WEBHOOK_SECRET = envGet(map, "EVOLUTION_WEBHOOK_SECRET");
  const DATABASE_URL = envGet(map, "DATABASE_URL");
  const expectedWebhook = `${APP_URL.replace(/\/$/, "")}/api/backend/webhooks/whatsapp`;

  console.log("\n=== Diagnóstico WhatsApp (Motocopiloto) ===\n");

  // 1) Vercel health público
  try {
    const health = await fetch(`${APP_URL}/api/backend/health`, {
      signal: AbortSignal.timeout(15_000),
    }).then((r) => r.json());
    console.log("1) API produção (/health)");
    console.log(`   ok: ${health.ok}, redis: ${health.redis}`);
    console.log(`   whatsappProcessing: ${health.whatsappProcessing}`);
    console.log(`   whatsappWorker: ${health.whatsappWorker}`);
    console.log(
      `   fila: waiting=${health.whatsappQueue?.waiting} failed=${health.whatsappQueue?.failed}`,
    );
  } catch (err) {
    console.log("1) API produção: FALHOU —", err.message);
  }

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    console.log("\n2) Evolution: EVOLUTION_API_URL/KEY ausentes no .env — pare aqui.");
    process.exit(1);
  }

  // 2) Evolution connection
  console.log("\n2) Evolution API");
  console.log(`   URL: ${maskUrl(EVOLUTION_API_URL)}`);
  console.log(`   instância: ${INSTANCE}`);

  const conn = await evolutionFetch(
    EVOLUTION_API_URL,
    EVOLUTION_API_KEY,
    `/instance/connectionState/${INSTANCE}`,
  );
  const state =
    conn.json?.instance?.state ?? conn.json?.state ?? JSON.stringify(conn.json);
  console.log(`   connectionState: ${conn.ok ? state : `HTTP ${conn.status}`}`);

  // 3) Webhook configurado na Evolution
  const wh = await evolutionFetch(
    EVOLUTION_API_URL,
    EVOLUTION_API_KEY,
    `/webhook/find/${INSTANCE}`,
  );
  if (!wh.ok) {
    console.log(`   (webhook/find HTTP ${wh.status} — API key local ≠ VPS?)`);
  }
  const whUrl =
    wh.json?.url ??
    wh.json?.webhook?.url ??
    wh.json?.webhookUrl ??
    null;
  const whEnabled = wh.json?.enabled ?? wh.json?.webhook?.enabled;
  const whEvents = wh.json?.events ?? wh.json?.webhook?.events ?? [];
  const whHeaders = wh.json?.headers ?? wh.json?.webhook?.headers ?? {};

  console.log("\n3) Webhook na Evolution (raiz do problema se URL errada)");
  console.log(`   esperado: ${expectedWebhook}`);
  console.log(`   configurado: ${whUrl ?? "(não encontrado)"}`);
  console.log(`   enabled: ${whEnabled}`);
  console.log(`   events: ${Array.isArray(whEvents) ? whEvents.join(", ") : whEvents}`);
  const hasApikeyHeader = Boolean(
    whHeaders?.apikey ?? whHeaders?.Apikey ?? whHeaders?.APIKEY,
  );
  console.log(`   header apikey no webhook: ${hasApikeyHeader ? "sim" : "NÃO"}`);

  const urlOk =
    typeof whUrl === "string" &&
    whUrl.replace(/\/$/, "") === expectedWebhook.replace(/\/$/, "");
  if (!urlOk) {
    console.log("\n   ❌ PROBLEMA: URL do webhook NÃO aponta para a Vercel.");
    console.log("      Rode: EVOLUTION_API_URL=... pnpm whatsapp:setup --qr-only");
    console.log("      Ou corrija no manager da Evolution.");
  } else if (!hasApikeyHeader) {
    console.log("\n   ❌ PROBLEMA: webhook sem header apikey — Vercel retorna 401.");
  } else if (!String(state).toLowerCase().includes("open")) {
    console.log("\n   ❌ PROBLEMA: WhatsApp desconectado na Evolution.");
  } else {
    console.log("\n   ✓ Webhook URL e instância parecem corretos.");
  }

  // 4) Teste webhook (só se secret no .env)
  if (WEBHOOK_SECRET) {
    console.log("\n4) Teste POST webhook (número fictício)");
    const testId = `diag-${Date.now()}`;
    const res = await fetch(expectedWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        event: "messages.upsert",
        data: {
          key: {
            remoteJid: "5531999999999@s.whatsapp.net",
            fromMe: false,
            id: testId,
          },
          message: { conversation: "R$ 30 entrega teste diagnostico" },
        },
      }),
      signal: AbortSignal.timeout(55_000),
    });
    const body = await res.text();
    console.log(`   HTTP ${res.status}`);
    console.log(`   body: ${body.slice(0, 400)}`);
    if (res.status === 401) {
      console.log("   ❌ Secret do webhook ≠ EVOLUTION_WEBHOOK_SECRET na Vercel.");
    }
  } else {
    console.log("\n4) Teste webhook: EVOLUTION_WEBHOOK_SECRET ausente no .env");
  }

  // 5) DB — mensagens recentes
  if (DATABASE_URL) {
    console.log("\n5) Banco (últimas mensagens WhatsApp)");
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient({
        datasources: { db: { url: DATABASE_URL } },
      });
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const [count, recent, deliveries] = await Promise.all([
        prisma.whatsAppMessage.count({
          where: { receivedAt: { gte: since } },
        }),
        prisma.whatsAppMessage.findMany({
          where: { receivedAt: { gte: since } },
          orderBy: { receivedAt: "desc" },
          take: 8,
          select: {
            receivedAt: true,
            fromNumber: true,
            messageType: true,
            userId: true,
            processedAs: true,
          },
        }),
        prisma.delivery.count({
          where: {
            createdAt: { gte: since },
            rawInput: { path: ["channel"], equals: "whatsapp" },
          },
        }),
      ]);
      console.log(`   mensagens WhatsApp (48h): ${count}`);
      console.log(`   entregas via WhatsApp (48h): ${deliveries}`);
      if (recent.length === 0) {
        console.log("   ❌ Nenhuma mensagem chegou ao banco — webhook não está entregando.");
      } else {
        for (const row of recent) {
          console.log(
            `   - ${row.receivedAt.toISOString()} from=${row.fromNumber} userId=${row.userId ?? "null"} type=${row.messageType}`,
          );
        }
      }
      await prisma.$disconnect();
    } catch (err) {
      console.log("   DB:", err.message);
    }
  } else {
    console.log("\n5) Banco: DATABASE_URL ausente no .env");
  }

  console.log("\n=== Fim ===\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
