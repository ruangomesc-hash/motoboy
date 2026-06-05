/**
 * Supabase: pooler (6543 + pgbouncer) → conexão direta (5432) para migrations/DDL.
 */
export function deriveDirectDatabaseUrl(databaseUrl: string): string {
  const raw = databaseUrl.trim();
  if (!raw) return raw;

  try {
    const url = new URL(raw);
    const isPooler =
      url.port === "6543" ||
      url.hostname.includes(".pooler.") ||
      url.searchParams.get("pgbouncer") === "true";

    if (isPooler) {
      url.port = "5432";
    }

    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("connection_limit");
    url.searchParams.delete("connect_timeout");

    return url.toString();
  } catch {
    return raw.replace(":6543/", ":5432/").replace(/[?&]pgbouncer=true/gi, "");
  }
}

/** Garante DIRECT_URL no process.env quando só há DATABASE_URL (Vercel / local). */
export function ensureDirectUrlEnv(): void {
  if (process.env.DIRECT_URL?.trim()) return;
  const db = process.env.DATABASE_URL?.trim();
  if (!db) return;
  process.env.DIRECT_URL = deriveDirectDatabaseUrl(db);
}
