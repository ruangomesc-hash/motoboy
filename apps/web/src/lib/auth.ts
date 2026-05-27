import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEMO_USER_ID } from "./demo-data";

import { loginAdminViaApi } from "./admin-auth";
import { resolveApiBase } from "./api-base";

const API_URL = resolveApiBase();

const demoAllowed =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === "true";

const adminDevAllowed =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN === "true";

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
        const verify = await fetch(`${API_URL}/auth/whatsapp/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await verify.json().catch(() => ({}))) as {
          error?: string;
          token: string;
          userId: string;
        };
        if (!verify.ok) {
          throw new Error(data.error ?? "Falha ao validar WhatsApp");
        }
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
        const res = await fetch(`${API_URL}/auth/password/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: credentials.phone.replace(/\D/g, ""),
            password: credentials.password,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          token: string;
          userId: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "WhatsApp ou senha incorretos");
        }
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
        const token = await loginAdminViaApi(
          credentials.email,
          credentials.password,
        );
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
