"use client";

import { useEffect } from "react";
import {
  APP_SYNC_EVENT,
  type AppSyncDetail,
  type AppSyncTopic,
  shouldHandleSync,
} from "@/lib/app-sync";

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
const POLL_MS = 15_000;

export function useAppSync(
  refresh: () => void | Promise<void>,
  topics: AppSyncTopic[] = ["all"],
  enabled = true,
): void {
  const topicsKey = topics.join(",");

  useEffect(() => {
    if (!enabled) return;

    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<AppSyncDetail>).detail;
      const incoming = detail?.topics ?? ["all"];
      if (shouldHandleSync(topics, incoming)) void refresh();
    };

    window.addEventListener(APP_SYNC_EVENT, onSync);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    let poll: ReturnType<typeof setInterval> | undefined;
    if (!SOCKET_ENABLED) {
      poll = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, POLL_MS);
    }

    return () => {
      window.removeEventListener(APP_SYNC_EVENT, onSync);
      document.removeEventListener("visibilitychange", onVisible);
      if (poll) clearInterval(poll);
    };
  }, [refresh, topicsKey, enabled]);
}
