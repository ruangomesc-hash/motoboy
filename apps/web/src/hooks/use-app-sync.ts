"use client";

import { useEffect } from "react";
import {
  subscribeAppSync,
  type AppSyncDetail,
  type AppSyncTopic,
  shouldHandleSync,
} from "@/lib/app-sync";

const POLL_MS = 500;

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

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.removeEventListener("focus", onFocus);
      clearInterval(poll);
    };
  }, [refresh, topicsKey, enabled]);
}
