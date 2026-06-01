/** Liveness do frontend na Vercel (sem auth). */
export async function GET() {
  return Response.json({
    ok: true,
    platform: "vercel",
    checkedAt: new Date().toISOString(),
  });
}
