import { withAuth } from "next-auth/middleware";

const isProd =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (
        pathname === "/login" ||
        pathname === "/cadastro" ||
        pathname === "/verify" ||
        pathname === "/admin/login"
      ) {
        return true;
      }
      if (pathname.startsWith("/admin")) {
        if (isProd && token?.adminDemo) return false;
        return Boolean(token?.isAdmin);
      }
      if (isProd && token?.demo) return false;
      return Boolean(token) && !token?.isAdmin;
    },
  },
});

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
