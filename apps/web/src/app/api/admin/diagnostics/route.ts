import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { IntegrationsHealthReport, PlatformHealthReport } from "@motoboy/types";
import { resolveApiBase } from "@/lib/api-base";

type WhatsAppPipelinePayload = Record<string, unknown>;

async function backendGet<T>(
  base: string,
  path: string,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const err = JSON.parse(text) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return (text.trim() ? JSON.parse(text) : {}) as T;
}

export async function GET(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "NEXTAUTH_SECRET não configurado na Vercel." },
      { status: 503 },
    );
  }

  const token = await getToken({
    req: request,
    secret,
  });

  const accessToken =
    typeof token?.accessToken === "string" ? token.accessToken : undefined;

  if (!token?.isAdmin || !accessToken) {
    return NextResponse.json(
      {
        error: "Sessão admin inválida",
        code: "ADMIN_SESSION_INVALID",
        needsRelogin: true,
        hint: "Saia do admin e entre de novo em /admin/login.",
      },
      { status: 401 },
    );
  }

  const base = resolveApiBase();

  try {
    const [integrations, platforms, whatsapp] = await Promise.all([
      backendGet<IntegrationsHealthReport>(
        base,
        "/admin/integrations/health",
        accessToken,
      ),
      backendGet<PlatformHealthReport>(
        base,
        "/admin/platform/health",
        accessToken,
      ),
      backendGet<WhatsAppPipelinePayload>(
        base,
        "/admin/whatsapp/pipeline",
        accessToken,
      ),
    ]);

    return NextResponse.json({ integrations, platforms, whatsapp });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao carregar diagnóstico";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
