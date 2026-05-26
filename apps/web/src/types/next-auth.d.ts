import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
    demo?: boolean;
    isAdmin?: boolean;
    adminDemo?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: string;
    demo?: boolean;
    isAdmin?: boolean;
    adminDemo?: boolean;
  }
}
