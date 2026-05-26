"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { adminDemoFetch } from "@/lib/admin-demo-data";

export function useAdminApi() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const isAdminDemo = session?.adminDemo === true;

  return useCallback(
    <T,>(path: string, options: RequestInit = {}) => {
      if (!session?.isAdmin || !token) {
        return Promise.reject(new Error("Sessão admin inválida"));
      }
      if (isAdminDemo) {
        return adminDemoFetch<T>(path, options);
      }
      return apiFetch<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [token, session?.isAdmin, isAdminDemo],
  );
}

export function useIsAdminDemoMode(): boolean {
  const { data: session } = useSession();
  return session?.adminDemo === true;
}
