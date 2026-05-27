import { resolveApiBase } from "./api-base";

export async function loginAdminViaApi(
  email: string,
  password: string,
): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`${resolveApiBase()}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique DATABASE_URL e as migrations no Supabase.",
    );
  }
  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    error?: string;
    code?: string;
  };
  if (!res.ok) {
    if (data.code === "MIGRATIONS_REQUIRED") {
      throw new Error(
        data.error ??
          "Banco sem tabelas. Rode migrations ou redeploy na Vercel com DATABASE_URL em Build.",
      );
    }
    if (data.code === "NEEDS_SETUP") {
      throw new Error(
        data.error ??
          "Primeiro acesso: use Continuar sem senha e defina sua senha.",
      );
    }
    throw new Error(data.error ?? "E-mail ou senha incorretos");
  }
  return data.token ?? null;
}
