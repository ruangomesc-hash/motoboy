import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { subscription?: unknown };
  // Web Push: persist subscription per user when VAPID keys are configured
  return NextResponse.json({
    ok: true,
    received: Boolean(body.subscription),
  });
}
