import type { SubscribeResponse } from "@motoboy/types";

export const PAYMENT_POLL_MS = 5000;
export const PAYMENT_POLL_MAX_MS = 20 * 60 * 1000;

export function pixQrSrc(encodedImage: string | null | undefined): string | null {
  if (!encodedImage?.trim()) return null;
  const raw = encodedImage.trim();
  if (raw.startsWith("data:")) return raw;
  return `data:image/png;base64,${raw}`;
}

type ApiFn = <T>(
  path: string,
  options?: RequestInit,
  apiOptions?: { skipSync?: boolean },
) => Promise<T>;

export async function requestSubscribeWithRetry(
  api: ApiFn,
  payload: Record<string, unknown>,
  attempt = 0,
): Promise<SubscribeResponse> {
  try {
    return await api<SubscribeResponse>("/me/subscribe", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const err = e as Error & { status?: number; code?: string };
    const retryable =
      err.status === 503 &&
      (err.code === "DATABASE_ERROR" ||
        err.code === "DATABASE_POOL_TIMEOUT" ||
        err.code === "DATABASE_UNAVAILABLE");
    if (retryable && attempt < 1) {
      await new Promise((r) => window.setTimeout(r, 1200));
      return requestSubscribeWithRetry(api, payload, attempt + 1);
    }
    throw e;
  }
}
