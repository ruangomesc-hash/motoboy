import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const isProd =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname === "/verify" ||
    pathname === "/admin/login"
  );
}

function redirectTo(request: NextRequest, targetPath: "/login" | "/admin/login") {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.search = "";
  return NextResponse.redirect(url);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = await getToken({ req: request });

  if (pathname.startsWith("/admin")) {
    const adminToken =
      typeof token?.accessToken === "string" ? token.accessToken : undefined;
    if (!token?.isAdmin || !adminToken) {
      return redirectTo(request, "/admin/login");
    }
    if (isProd && token.adminDemo) {
      return redirectTo(request, "/admin/login");
    }
    return NextResponse.next();
  }

  const accessToken =
    typeof token?.accessToken === "string" ? token.accessToken.trim() : "";
  if (!token || token.isAdmin || !accessToken) {
    return redirectTo(request, "/login");
  }
  if (isProd && token.demo) {
    return redirectTo(request, "/login");
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/entregas/:path*",
    "/rota",
    "/stats",
    "/config",
    "/assinar",
    "/historico",
    "/admin",
    "/admin/:path*",
  ],
};
