import { withAuth } from "next-auth/middleware";

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
        return Boolean(token?.isAdmin);
      }
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
