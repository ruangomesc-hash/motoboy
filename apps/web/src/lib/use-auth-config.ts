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

  const skipAuthCode = loaded
    ? Boolean(config?.skipAuthCode)
    : false;

  const evolutionConfigured = loaded
    ? Boolean(config?.evolutionConfigured)
    : false;

  return { skipAuthCode, evolutionConfigured, loaded };
}
