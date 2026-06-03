import { prisma } from "@motoboy/db";
import type { UserStatus } from "@motoboy/db";

export type SessionUser = {
  id: string;
  whatsappNumber: string;
  email: string | null;
  name: string | null;
  status: UserStatus;
  trialEndsAt: Date | null;
  subscribedAt: Date | null;
};

export async function loadSessionUser(
  userId: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      whatsappNumber: true,
      email: true,
      name: true,
      status: true,
      trialEndsAt: true,
      subscribedAt: true,
    },
  });
  return user;
}

/** Trial válido ou assinatura ativa — uso do app liberado. PAUSED = inadimplente (só rotas de cobrança). */
export function hasAppAccess(user: SessionUser, now = new Date()): boolean {
  if (user.status === "ACTIVE") return true;
  if (user.status === "TRIAL" && user.trialEndsAt && user.trialEndsAt > now) {
    return true;
  }
  return false;
}

/** Rotas liberadas mesmo com trial expirado (pagar / ver status). */
export function isBillingRoute(method: string, path: string): boolean {
  const p = path.split("?")[0] ?? path;
  if (p === "/me/subscription") return true;
  if (p === "/me/subscription/cancel" && method === "POST") return true;
  if (p === "/me/subscription/refresh" && method === "POST") return true;
  if (p === "/me/subscribe" && method === "POST") return true;
  if (p === "/me/profile" && (method === "PUT" || method === "GET")) return true;
  if (p === "/me" && method === "GET") return true;
  return false;
}
