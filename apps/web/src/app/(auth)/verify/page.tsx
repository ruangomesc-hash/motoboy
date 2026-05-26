"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import {
  clearPersistedAffiliateCode,
  readPersistedAffiliateCode,
} from "@/lib/affiliate-ref";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    setIsRegister(sessionStorage.getItem("motoboy-auth-mode") === "register");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = sessionStorage.getItem("motoboy-phone");
    if (!phone) {
      router.push("/cadastro");
      return;
    }
    const mode = sessionStorage.getItem("motoboy-auth-mode");
    const name = sessionStorage.getItem("motoboy-name");
    const email = sessionStorage.getItem("motoboy-email");

    if (mode === "register" && (!name || !email)) {
      router.push("/cadastro");
      return;
    }

    setLoading(true);
    setError("");
    const affiliateCode = readPersistedAffiliateCode() ?? undefined;

    const result = await signIn("whatsapp", {
      phone,
      code,
      name: name ?? "",
      email: email ?? "",
      affiliateCode: affiliateCode ?? "",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Código inválido ou expirado.");
      return;
    }
    sessionStorage.removeItem("motoboy-name");
    sessionStorage.removeItem("motoboy-email");
    sessionStorage.removeItem("motoboy-auth-mode");
    clearPersistedAffiliateCode();
    router.push("/");
  }

  return (
    <AuthShell
      title="Código de verificação"
      subtitle={
        isRegister
          ? "Confira o WhatsApp. Estamos criando sua conta."
          : "Confira a mensagem que o Motocopiloto enviou no WhatsApp."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="text-center text-2xl tracking-[0.5em] font-mono"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Verificando..." : "Confirmar e entrar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground pt-2">
          <Link href="/login" className="text-emerald-400 underline">
            Voltar
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
