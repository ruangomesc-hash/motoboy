import { handleBackendRequest } from "@motoboy/api/vercel-handler";
import { validateAdminSetupProxy } from "@/lib/backend-proxy-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const blocked = validateAdminSetupProxy(request.method, path, request);
  if (blocked) return blocked;

  return handleBackendRequest(request, path);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
