export function isPrismaTableMissingError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string }).code;
  return (
    code === "P2021" ||
    msg.includes("does not exist") ||
    msg.includes("relation") && msg.includes("does not exist")
  );
}

export const MIGRATIONS_REQUIRED_MESSAGE =
  "Banco sem tabelas atualizadas. Na Vercel: marque DATABASE_URL e DIRECT_URL em Build e faça Redeploy (sem cache). Ou no Mac: bash scripts/setup-supabase.sh";
