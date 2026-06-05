"use client";

import { useEffect, useRef } from "react";
import { fetchPixQrFast } from "./shared";

type ApiFn = <T>(
  path: string,
  options?: RequestInit,
  apiOptions?: { skipSync?: boolean },
) => Promise<T>;

export type PixQrPayload = {
  pixCopyPaste: string | null;
  pixQrCodeImage: string | null;
};

const POLL_MS = 700;
const MAX_POLL_MS = 120_000;

/**
 * Atualiza o checkout assim que o Asaas liberar o QR (poll leve ~700ms).
 */
export function useRealtimePixQr(
  chargeId: string | null | undefined,
  api: ApiFn,
  onQr: (qr: PixQrPayload) => void,
  enabled: boolean,
): void {
  const onQrRef = useRef(onQr);
  onQrRef.current = onQr;

  useEffect(() => {
    if (!enabled || !chargeId?.trim()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const started = Date.now();

    const schedule = () => {
      if (cancelled) return;
      timer = setTimeout(() => void tick(), POLL_MS);
    };

    const tick = async () => {
      if (cancelled || Date.now() - started > MAX_POLL_MS) return;

      const qr = await fetchPixQrFast(api, chargeId);
      if (cancelled) return;

      if (qr) {
        onQrRef.current(qr);
        return;
      }

      schedule();
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [api, chargeId, enabled]);
}
