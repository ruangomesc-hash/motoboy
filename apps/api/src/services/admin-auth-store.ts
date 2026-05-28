import { prisma } from "@motoboy/db";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  isPrismaTableMissingError,
  MIGRATIONS_REQUIRED_MESSAGE,
} from "../lib/prisma-errors.js";

const ADMIN_ID = "primary";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "").trim();
}

export function envAdminCredentialsConfigured(): boolean {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = normalizeEnvSecret(process.env.ADMIN_PASSWORD);
  return Boolean(email && password);
}

export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function isAdminTableReady(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "AdminAccount" LIMIT 1`;
    return true;
  } catch (err) {
    if (isPrismaTableMissingError(err)) return false;
    return false;
  }
}

export async function isAdminConfigured(): Promise<boolean> {
  if (!(await isAdminTableReady())) return false;
  try {
    const row = await prisma.adminAccount.findUnique({ where: { id: ADMIN_ID } });
    return Boolean(row);
  } catch (err) {
    if (isPrismaTableMissingError(err)) return false;
    return false;
  }
}

function verifyEnvAdmin(email: string, password: string): boolean {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = normalizeEnvSecret(process.env.ADMIN_PASSWORD);
  if (!envEmail || !envPassword) return false;
  return normalizeEmail(email) === envEmail && password === envPassword;
}

export async function setupAdminAccount(
  email: string,
  password: string,
): Promise<{ email: string }> {
  if (!(await isAdminTableReady())) {
    throw Object.assign(new Error(MIGRATIONS_REQUIRED_MESSAGE), {
      statusCode: 503,
      code: "MIGRATIONS_REQUIRED",
    });
  }
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
  try {
    await prisma.adminAccount.create({
      data: {
        id: ADMIN_ID,
        email: normalized,
        passwordHash: await hashPassword(password),
      },
    });
  } catch (err) {
    if (isPrismaTableMissingError(err)) {
      throw Object.assign(new Error(MIGRATIONS_REQUIRED_MESSAGE), {
        statusCode: 503,
        code: "MIGRATIONS_REQUIRED",
      });
    }
    throw err;
  }
  return { email: normalized };
}

export async function resetAdminAccountWithToken(
  email: string,
  password: string,
): Promise<{ email: string }> {
  if (!(await isAdminTableReady())) {
    throw Object.assign(new Error(MIGRATIONS_REQUIRED_MESSAGE), {
      statusCode: 503,
      code: "MIGRATIONS_REQUIRED",
    });
  }
  if (password.length < 8) {
    throw Object.assign(new Error("Senha deve ter no mínimo 8 caracteres"), {
      statusCode: 400,
    });
  }

  const normalized = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  const byEmail = await prisma.adminAccount.findUnique({
    where: { email: normalized },
  });

  if (byEmail) {
    await prisma.adminAccount.update({
      where: { id: byEmail.id },
      data: { email: normalized, passwordHash },
    });
    return { email: normalized };
  }

  const primary = await prisma.adminAccount.findUnique({
    where: { id: ADMIN_ID },
  });
  if (primary) {
    await prisma.adminAccount.update({
      where: { id: ADMIN_ID },
      data: { email: normalized, passwordHash },
    });
    return { email: normalized };
  }

  await prisma.adminAccount.create({
    data: {
      id: ADMIN_ID,
      email: normalized,
      passwordHash,
    },
  });
  return { email: normalized };
}

export async function verifyAdminLoginWithEnvFallback(
  email: string,
  password: string,
): Promise<boolean> {
  if (envAdminCredentialsConfigured() && verifyEnvAdmin(email, password)) {
    return true;
  }

  if (!(await isAdminTableReady())) return false;

  const normalizedEmail = normalizeEmail(email);
  // Compat: prioriza email (dados antigos podem ter id diferente de "primary").
  const account =
    (await prisma.adminAccount.findUnique({
      where: { email: normalizedEmail },
    })) ??
    (await prisma.adminAccount.findUnique({
      where: { id: ADMIN_ID },
    }));
  if (!account) return false;

  if (normalizedEmail !== account.email) return false;

  return verifyAdminPasswordCompat(password, account.passwordHash);
}

async function verifyAdminPasswordCompat(
  password: string,
  storedHash: string,
): Promise<boolean> {
  // Formato atual: scrypt ("salt:hash")
  if (storedHash.includes(":")) {
    return verifyPassword(password, storedHash);
  }

  // Compat legado: dados antigos podem ter senha salva sem hash.
  // Se autenticar aqui, o usuário consegue entrar e depois pode redefinir senha.
  return storedHash === password;
}
