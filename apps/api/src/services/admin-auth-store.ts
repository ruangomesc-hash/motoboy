import { prisma } from "@motoboy/db";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const ADMIN_ID = "primary";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "").trim();
}

export async function isAdminConfigured(): Promise<boolean> {
  const row = await prisma.adminAccount.findUnique({ where: { id: ADMIN_ID } });
  return Boolean(row);
}

async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyAdminPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

export async function setupAdminAccount(
  email: string,
  password: string,
): Promise<{ email: string }> {
  if (password.length < 8) {
    throw Object.assign(new Error("Senha deve ter no mínimo 8 caracteres"), {
      statusCode: 400,
    });
  }
  if (await isAdminConfigured()) {
    throw Object.assign(new Error("Painel admin já configurado"), {
      statusCode: 409,
    });
  }
  const normalized = normalizeEmail(email);
  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && normalized !== bootstrapEmail) {
    throw Object.assign(
      new Error("Use o e-mail configurado em ADMIN_EMAIL na Vercel"),
      { statusCode: 403 },
    );
  }
  await prisma.adminAccount.create({
    data: {
      id: ADMIN_ID,
      email: normalized,
      passwordHash: await hashAdminPassword(password),
    },
  });
  return { email: normalized };
}

export async function verifyAdminLoginWithEnvFallback(
  email: string,
  password: string,
): Promise<boolean> {
  const account = await prisma.adminAccount.findUnique({
    where: { id: ADMIN_ID },
  });
  if (account) {
    return (
      normalizeEmail(email) === account.email &&
      (await verifyAdminPassword(password, account.passwordHash))
    );
  }
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = normalizeEnvSecret(process.env.ADMIN_PASSWORD);
  if (!envEmail || !envPassword) return false;
  return normalizeEmail(email) === envEmail && password === envPassword;
}
