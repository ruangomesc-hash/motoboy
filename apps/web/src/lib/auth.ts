import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { handleBackendRequest } from "@motoboy/api/vercel-handler";
import { DEMO_USER_ID } from "./demo-data";

const isProd =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

const demoAllowed =
  !isProd && process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === "true";

const adminDevAllowed =
  !isProd && process.env.NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN === "true";

async function callBackendAuth<T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; error?: string; code?: string }> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathSegments = normalizedPath.split("/").filter(Boolean);
  const request = new Request(`http://internal${normalizedPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const response = await handleBackendRequest(request, pathSegments);
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  } & T;
  if (!response.ok) {
    return { ok: false, error: data.error, code: data.code };
  }
  return { ok: true, data };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "whatsapp",
      name: "WhatsApp",
      credentials: {
        phone: { label: "Telefone", type: "text" },
        code: { label: "Código", type: "text" },
        name: { label: "Nome", type: "text" },
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
        affiliateCode: { label: "Cupom", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;
        const payload: {
          phone: string;
          code: string;
          name?: string;
          email?: string;
          password?: string;
          affiliateCode?: string;
        } = {
          phone: credentials.phone.replace(/\D/g, ""),
          code: credentials.code,
        };
        if (credentials.name?.trim()) payload.name = credentials.name.trim();
        if (credentials.email?.trim()) payload.email = credentials.email.trim();
        if (credentials.affiliateCode?.trim()) {
          payload.affiliateCode = credentials.affiliateCode.trim().toUpperCase();
        }
        if (credentials.password?.trim()) {
          payload.password = credentials.password.trim();
        }
        const verify = await callBackendAuth<{ token: string; userId: string }>(
          "/auth/whatsapp/verify",
          payload,
        );
        if (!verify.ok) {
          throw new Error(verify.error ?? "Falha ao validar WhatsApp");
        }
        const data = verify.data;
        if (!data.userId || !data.token) return null;
        return {
          id: data.userId,
          phone: credentials.phone,
          accessToken: data.token,
          demo: false,
        };
      },
    }),
    CredentialsProvider({
      id: "password",
      name: "Senha",
      credentials: {
        phone: { label: "Telefone", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        const login = await callBackendAuth<{ token: string; userId: string }>(
          "/auth/password/login",
          {
            phone: credentials.phone.replace(/\D/g, ""),
            password: credentials.password,
          },
        );
        if (!login.ok) {
          throw new Error(login.error ?? "WhatsApp ou senha incorretos");
        }
        const data = login.data;
        if (!data.userId || !data.token) return null;
        return {
          id: data.userId,
          phone: credentials.phone,
          accessToken: data.token,
          demo: false,
        };
      },
    }),
    ...(demoAllowed
      ? [
          CredentialsProvider({
            id: "demo",
            name: "Demonstração",
            credentials: {},
            async authorize() {
              return {
                id: DEMO_USER_ID,
                name: "Carlos (demo)",
                accessToken: "demo-token",
                demo: true,
              };
            },
          }),
        ]
      : []),
    ...(adminDevAllowed
      ? [
          CredentialsProvider({
            id: "admin-dev",
            name: "Admin (sem API)",
            credentials: {},
            async authorize() {
              return {
                id: "admin",
                name: "Administrador (preview)",
                accessToken: "admin-demo-token",
                isAdmin: true,
                adminDemo: true,
                demo: false,
              };
            },
          }),
        ]
      : []),
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const login = await callBackendAuth<{ token: string }>(
          "/admin/auth/login",
          {
            email: credentials.email.trim(),
            password: credentials.password,
          },
        );
        if (!login.ok) {
          if (login.code === "MIGRATIONS_REQUIRED") {
            throw new Error(
              login.error ??
                "Banco sem tabelas. Rode migrations ou redeploy na Vercel com DATABASE_URL em Build.",
            );
          }
          if (login.code === "NEEDS_SETUP") {
            throw new Error(
              login.error ??
                "Primeiro acesso: use Continuar sem senha e defina sua senha.",
            );
          }
          throw new Error(login.error ?? "E-mail ou senha incorretos");
        }
        const token = login.data.token;
        if (!token) return null;
        return {
          id: "admin",
          name: "Administrador",
          accessToken: token,
          isAdmin: true,
          demo: false,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) return url;
      } catch {
        /* ignore and fallback */
      }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.userId = user.id;
        token.demo = (user as { demo?: boolean }).demo ?? false;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        token.adminDemo = (user as { adminDemo?: boolean }).adminDemo ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      session.demo = Boolean(token.demo);
      session.isAdmin = Boolean(token.isAdmin);
      session.adminDemo = Boolean(token.adminDemo);
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
