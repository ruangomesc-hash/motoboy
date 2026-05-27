"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { extractCreatedDelivery } from "@/lib/app-data-cache";
import { notifyAppSync, syncTopicsForPath } from "@/lib/app-sync";
import { demoFetch } from "@/lib/demo-data";

export type UseApiOptions = { skipSync?: boolean };

export function useApi() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const isDemo = session?.demo === true;

  return useCallback(
    async <T,>(
      path: string,
      options: RequestInit = {},
      apiOptions?: UseApiOptions,
    ): Promise<T> => {
      const method = (options.method ?? "GET").toUpperCase();
      const result = isDemo
        ? await demoFetch<T>(path, options)
        : await apiFetch<T>(path, {
            ...options,
            headers: {
              ...options.headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
      if (!apiOptions?.skipSync) {
        const syncTopics = syncTopicsForPath(path, method);
        if (syncTopics.length > 0) {
          const delivery = extractCreatedDelivery(result, path, method);
          notifyAppSync(syncTopics, delivery ? { delivery } : undefined);
        }
      }
      return result;
    },
    [token, isDemo],
  );
}

export function useIsDemoMode(): boolean {
  const { data: session } = useSession();
  return session?.demo === true;
}
