import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
    /** 11 dígitos locais do WhatsApp (cadastro/login). */
    phone?: string;
    demo?: boolean;
    isAdmin?: boolean;
    adminDemo?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: string;
    phone?: string;
    demo?: boolean;
    isAdmin?: boolean;
    adminDemo?: boolean;
  }
}
