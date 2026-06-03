import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveApiBase } from "@/lib/api-base";

async function adminProxy(
  request: NextRequest,
  phone: string,
  action: "block" | "unblock",
) {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "NEXTAUTH_SECRET não configurado." },
      { status: 503 },
    );
  }

  const token = await getToken({ req: request, secret });
  const accessToken =
    typeof token?.accessToken === "string" ? token.accessToken : undefined;

  if (!token?.isAdmin || !accessToken) {
    return NextResponse.json(
      { error: "Sessão admin inválida", needsRelogin: true },
      { status: 401 },
    );
  }

  const encoded = encodeURIComponent(phone);
  const base = resolveApiBase();
  const res = await fetch(
    `${base}/admin/whatsapp/unknown-senders/${encoded}/${action}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  const text = await res.text();
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const err = JSON.parse(text) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      /* ignore */
    }
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json(text.trim() ? JSON.parse(text) : { ok: true });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { phone?: string; action?: string };
  const phone = body.phone?.trim();
  if (!phone) {
    return NextResponse.json({ error: "Informe o número." }, { status: 400 });
  }
  const action = body.action === "unblock" ? "unblock" : "block";
  return adminProxy(request, phone, action);
}
