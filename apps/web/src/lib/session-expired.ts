const AUTH_REDIRECT_CODES = new Set([
  "JWT_INVALID",
  "JWT_EXPIRED",
  "NOT_AUTHENTICATED",
  "SESSION_INVALID",
  "USER_NOT_FOUND",
]);

let redirecting = false;

/** Encerra sessão NextAuth quando o token do motoboy não vale mais. */
export async function redirectIfSessionInvalid(
  status: number,
  code?: string,
): Promise<void> {
  if (typeof window === "undefined" || redirecting) return;
  if (status !== 401 || !code || !AUTH_REDIRECT_CODES.has(code)) return;

  redirecting = true;
  try {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/login?session=expired" });
  } finally {
    redirecting = false;
  }
}
