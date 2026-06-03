"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import { parseBrazilWhatsAppDigits } from "@motoboy/types";
import { clearPersistedAffiliateCode } from "@/lib/affiliate-ref";
import { readPendingRegistration } from "@/lib/registration-pending";

const skipAuthCodeAllowed =
  process.env.NEXT_PUBLIC_ALLOW_SKIP_AUTH_CODE === "true";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const register =
      searchParams.get("register") === "1" ||
      sessionStorage.getItem("motoboy-auth-mode") === "register";
    setIsRegister(register);
    const pending = readPendingRegistration({ requirePassword: false });
    const phoneParam = searchParams.get("phone")?.trim();
    if (register && !pending) {
      router.replace("/cadastro");
      return;
    }
    if (!register && !pending && !phoneParam) {
      router.replace("/login");
    }
  }, [searchParams, router]);

  function resolveLoginPhone(): string | null {
    const pending = readPendingRegistration({ requirePassword: false });
    if (pending?.phone) return pending.phone;
    const raw = searchParams.get("phone")?.trim();
    if (!raw) return null;
    try {
      return parseBrazilWhatsAppDigits(raw);
    } catch {
      return null;
    }
  }

  async function submitCode(submittedCode: string) {
    const pending = readPendingRegistration({ requirePassword: false });
    const phone = resolveLoginPhone();
    if (!phone) {
      router.push(isRegister ? "/cadastro" : "/login");
      return;
    }

    setError("");
    const result = await signIn("whatsapp", {
      phone,
      code: submittedCode,
      ...(pending
        ? {
            name: pending.name,
            email: pending.email,
            password: pending.password,
            affiliateCode: pending.affiliateCode ?? "",
          }
        : {}),
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Código inválido ou expirado."
          : result.error,
      );
      return false;
    }

    clearPersistedAffiliateCode();
    router.push(isRegister ? "/config?setup=1" : "/");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitCode(code);
    setLoading(false);
  }

  async function enterWithoutCode() {
    setSkipLoading(true);
    await submitCode("000000");
    setSkipLoading(false);
  }

  return (
    <AuthShell
      title="Código de verificação"
      subtitle={
        isRegister
          ? "Confira o WhatsApp. Estamos criando sua conta com os dados do cadastro."
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
        {skipAuthCodeAllowed && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-emerald-500/40"
            disabled={skipLoading || loading}
            onClick={enterWithoutCode}
          >
            {skipLoading ? "Entrando..." : "Continuar sem código (temporário)"}
          </Button>
        )}
        <p className="text-center text-sm text-muted-foreground pt-2">
          {isRegister ? (
            <Link href="/cadastro" className="text-emerald-400 underline">
              Voltar ao cadastro
            </Link>
          ) : (
            <Link href="/login" className="text-emerald-400 underline">
              Voltar ao login
            </Link>
          )}
        </p>
      </form>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Código de verificação" subtitle="Carregando...">
          <p className="text-sm text-muted-foreground text-center">Aguarde</p>
        </AuthShell>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
