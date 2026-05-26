import { resolveApiBase } from "./api-base";

const API_BASE = resolveApiBase();

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let message: string | undefined;
    try {
      const err = JSON.parse(text) as { error?: string; message?: string };
      message = err.error ?? err.message;
    } catch {
      /* body não é JSON (ex.: proxy do Next quando a API está offline) */
    }
    if (!message) {
      if (res.status === 500 || res.status === 502 || res.status === 503) {
        message =
          "Não foi possível falar com o servidor. Confira a conexão com o banco (Supabase) e as variáveis na Vercel.";
      } else {
        message = `Erro ${res.status}`;
      }
    }
    const err = new Error(message) as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    try {
      const parsed = JSON.parse(text) as { code?: string };
      err.code = parsed.code;
    } catch {
      /* ignore */
    }
    if (res.status === 402 && typeof window !== "undefined") {
      window.location.href = "/assinar";
    }
    throw err;
  }
  return res.json() as Promise<T>;
}
