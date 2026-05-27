"use client";

import { useEffect, useState } from "react";

export type AuthConfig = {
  skipAuthCode: boolean;
  evolutionConfigured: boolean;
};

export function useAuthConfig() {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch("/api/backend/auth/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: AuthConfig | null) => {
        if (d) setConfig(d);
      })
      .finally(() => setLoaded(true));
  }, []);

  const skipAuthCode = !loaded
    ? true
    : (config?.skipAuthCode ??
      process.env.NEXT_PUBLIC_ALLOW_SKIP_AUTH_CODE === "true");

  return { skipAuthCode, loaded };
}
