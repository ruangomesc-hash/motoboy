"use client";

import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import { useSession } from "next-auth/react";

/** Carrega perfil uma vez para pré-preencher CPF/nome no checkout. */
export function useCheckoutProfile() {
  const api = useApi();
  const { status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || loaded.current) return;
    void api<UserProfile>("/me/profile", {}, { skipSync: true })
      .then((p) => {
        setProfile(p);
        loaded.current = true;
      })
      .catch(() => {
        void api<{ profile: UserProfile }>("/me", {}, { skipSync: true })
          .then((me) => {
            setProfile(me.profile);
            loaded.current = true;
          })
          .catch(() => {
            /* formulário vazio */
          });
      });
  }, [api, sessionStatus]);

  return profile;
}
