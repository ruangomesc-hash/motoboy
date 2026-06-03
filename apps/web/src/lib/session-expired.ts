const AUTH_REDIRECT_CODES = new Set([
  "JWT_INVALID",
  "JWT_EXPIRED",
  "NOT_AUTHENTICATED",
  "SESSION_INVALID",
  "USER_NOT_FOUND",
]);

let redirecting = false;

/** Remove cookie legado que pode sobrescrever o Bearer com token antigo. */
export function clearMotoboyTokenCookie(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `motoboy-token=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/** Encerra sessão NextAuth quando o token do motoboy não vale mais. */
export async function redirectIfSessionInvalid(
  status: number,
  code?: string,
): Promise<void> {
  if (typeof window === "undefined" || redirecting) return;
  if (status !== 401 || !code || !AUTH_REDIRECT_CODES.has(code)) return;

  redirecting = true;
  clearMotoboyTokenCookie();
  try {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/login?session=expired" });
  } finally {
    redirecting = false;
  }
}
