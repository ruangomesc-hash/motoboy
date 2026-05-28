export type RegisterPendingPayload = {
  name: string;
  email: string;
  password: string;
  affiliateCode?: string;
};

export function registerPendingRedisKey(phone: string): string {
  return `register:pending:${phone}`;
}

export function parseRegisterPending(raw: string | null): RegisterPendingPayload | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as RegisterPendingPayload;
    if (
      !data.name?.trim() ||
      !data.email?.trim() ||
      !data.password ||
      data.password.length < 8
    ) {
      return null;
    }
    return {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      affiliateCode: data.affiliateCode?.trim()
        ? data.affiliateCode.trim().toUpperCase()
        : undefined,
    };
  } catch {
    return null;
  }
}
