#!/usr/bin/env node
/**
 * Baixa vars da Vercel e gera railway.env para colar no Railway (Raw Editor).
 *
 * Uso:
 *   pnpm railway:env
 *
 * Pré-requisito (uma vez):
 *   npx vercel login
 *   npx vercel link   # escolha o projeto app.motocopiloto
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pullFile = path.join(root, ".env.vercel-pull");
const outFile = path.join(root, "railway.env");

const RAILWAY_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "REDIS_URL",
  "EVOLUTION_API_URL",
  "EVOLUTION_API_KEY",
  "EVOLUTION_INSTANCE",
  "EVOLUTION_WEBHOOK_SECRET",
  "EVOLUTION_BOT_NUMBER",
  "JWT_SECRET",
  "OPENAI_API_KEY",
];

const RAILWAY_DEFAULTS = {
  APP_URL: "https://app.motocopiloto.com.br",
  EVOLUTION_API_URL: "https://evo.motocopiloto.com.br",
  EVOLUTION_INSTANCE: "motoboy",
  RUN_WHATSAPP_WORKER: "true",
};

function log(msg) {
  console.log(msg);
}

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function parseEnv(text) {
  const map = new Map();
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

function main() {
  log("\n🛵 Motocopiloto — gerar railway.env da Vercel\n");

  try {
    execSync("npx vercel --version", { stdio: "pipe", cwd: root });
  } catch {
    die("Instale/login: npx vercel login");
  }

  log("⏳ Baixando variáveis de produção (vercel env pull)...");
  try {
    execSync(
      `npx vercel env pull "${pullFile}" --environment=production --yes`,
      { stdio: "inherit", cwd: root },
    );
  } catch {
    die(
      "Falhou o pull. Rode no Mac:\n  npx vercel login\n  npx vercel link\n  pnpm railway:env",
    );
  }

  if (!fs.existsSync(pullFile)) {
    die(`Arquivo não criado: ${pullFile}`);
  }

  const map = parseEnv(fs.readFileSync(pullFile, "utf8"));
  const lines = [
    "# Variáveis Sensitive na Vercel NÃO vêm no arquivo (segurança).",
    "# Copie cada valor na Vercel (ícone olho) e preencha abaixo, depois cole no Railway.",
    "",
  ];
  const missing = [];
  let filled = 0;

  for (const key of RAILWAY_KEYS) {
    if (key === "JWT_SECRET" || key === "OPENAI_API_KEY") continue;
    let v = map.get(key)?.trim() ?? "";
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (
      !v ||
      v.includes("seuservidor") ||
      v.includes("localhost") ||
      v.includes("PROJECT_REF")
    ) {
      missing.push(key);
      lines.push(`${key}=`);
    } else {
      filled++;
      lines.push(`${key}=${v}`);
    }
  }

  for (const opt of ["OPENAI_API_KEY", "JWT_SECRET"]) {
    let v =
      process.env[opt]?.trim() ||
      map.get(opt)?.trim() ||
      "";
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v && !v.includes("VALUE or")) {
      lines.push(`${opt}=${v}`);
    } else {
      lines.push(`${opt}=`);
      missing.push(opt);
    }
  }

  for (const [k, def] of Object.entries(RAILWAY_DEFAULTS)) {
    let v = map.get(k)?.trim() ?? "";
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    lines.push(`${k}=${v && !v.includes("seu-app") ? v : def}`);
  }

  lines.push("");

  fs.writeFileSync(outFile, lines.join("\n"));

  log(`📄 Gerado: ${outFile}`);

  if (filled === 0) {
    log(`
⚠️  A Vercel não exporta valores de variáveis **Sensitive** (Encrypted).
   O arquivo só tem os NOMES — você precisa copiar na mão:

   Vercel → Settings → Environment Variables → clique em cada uma → ícone 👁 → Copy

   Preencha railway.env e cole no Railway → Variables → Raw Editor.

   Ou adicione uma a uma no Railway (+ New Variable) sem usar o arquivo.
`);
    process.exit(0);
  }

  log("\nPróximo passo:");
  log("  1. Abra railway.env — preencha linhas vazias (Vercel → olho + OPENAI_API_KEY)");
  log("  2. pnpm railway:push   (ou cole no Railway Raw Editor)");
  log("  3. Teste: R$ 30 entrega teste\n");

  if (missing.length) {
    log(`⚠️  Ainda vazias no pull: ${missing.join(", ")}`);
    log("   Copie da Vercel (olho) e preencha railway.env manualmente.\n");
  }
}

main();
