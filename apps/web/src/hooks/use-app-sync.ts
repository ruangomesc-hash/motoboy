"use client";

import { useEffect } from "react";
import {
  subscribeAppSync,
  type AppSyncDetail,
  type AppSyncTopic,
  shouldHandleSync,
} from "@/lib/app-sync";

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
const POLL_MS = 8_000;

export function useAppSync(
  refresh: () => void | Promise<void>,
  topics: AppSyncTopic[] = ["all"],
  enabled = true,
): void {
  const topicsKey = topics.join(",");

  useEffect(() => {
    if (!enabled) return;

    const onDetail = (detail: AppSyncDetail) => {
      const incoming = detail.topics ?? ["all"];
      if (detail.skipReconcile) return;
      if (shouldHandleSync(topics, incoming)) void refresh();
    };

    const unsubscribe = subscribeAppSync(onDetail);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onFocus = () => void refresh();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    window.addEventListener("focus", onFocus);

    let poll: ReturnType<typeof setInterval> | undefined;
    if (!SOCKET_ENABLED) {
      poll = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, POLL_MS);
    }

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.removeEventListener("focus", onFocus);
      if (poll) clearInterval(poll);
    };
  }, [refresh, topicsKey, enabled]);
}
