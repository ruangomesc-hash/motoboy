import jwt from "jsonwebtoken";

function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "").trim();
}

export function getAdminCredentialsFromEnv(): {
  email: string;
  password: string;
} | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = normalizeEnvSecret(process.env.ADMIN_PASSWORD);
  if (!email || !password) return null;
  return { email, password };
}

/** Valida admin e emite JWT (mesmo formato da API). */
export function issueAdminToken(email: string, password: string): string | null {
  const creds = getAdminCredentialsFromEnv();
  if (!creds) return null;

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== creds.email || password !== creds.password) {
    return null;
  }

  const secret = normalizeEnvSecret(process.env.JWT_SECRET);
  if (!secret || secret.length < 16) return null;

  return jwt.sign(
    { userId: "admin", role: "admin" as const },
    secret,
    { expiresIn: "7d" },
  );
}
