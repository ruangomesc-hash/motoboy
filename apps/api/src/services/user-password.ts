import { prisma } from "@motoboy/db";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { normalizePhone } from "../lib/phone.js";
import { findUserByPhone } from "./user.js";

export async function userHasPassword(phone: string): Promise<boolean> {
  const user = await findUserByPhone(phone);
  return Boolean(user?.passwordHash);
}

export async function setUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });
}

export async function verifyUserPasswordLogin(
  phone: string,
  password: string,
): Promise<{ id: string; whatsappNumber: string } | null> {
  const user = await findUserByPhone(phone);
  if (!user?.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, whatsappNumber: user.whatsappNumber };
}

export async function setUserPasswordByPhone(
  phone: string,
  password: string,
): Promise<void> {
  const normalized = normalizePhone(phone);
  const user = await prisma.user.findUnique({
    where: { whatsappNumber: normalized },
    select: { id: true },
  });
  if (!user) {
    throw Object.assign(new Error("Conta não encontrada"), { statusCode: 404 });
  }
  await setUserPassword(user.id, password);
}
