"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import { resolveApiBase } from "@/lib/api-base";
import {
  maskPhone,
  parseBrazilWhatsAppDigits,
  WHATSAPP_VALIDATION_MESSAGE,
} from "@/lib/phone-mask";

const demoLoginAllowed =
  process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === "true";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    sessionExpired
      ? "Sua sessão expirou ou foi invalidada. Entre de novo com senha ou código no WhatsApp."
      : "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let digits: string;
    try {
      digits = parseBrazilWhatsAppDigits(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : WHATSAPP_VALIDATION_MESSAGE);
      return;
    }
    if (!password) {
      setError("Informe sua senha.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await signIn("password", {
      phone: digits,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "WhatsApp ou senha incorretos."
          : result.error,
      );
      return;
    }
    router.push("/");
  }

  async function loginWithWhatsAppCode() {
    let digits: string;
    try {
      digits = parseBrazilWhatsAppDigits(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : WHATSAPP_VALIDATION_MESSAGE);
      return;
    }
    setCodeLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${resolveApiBase()}/auth/whatsapp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: digits }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(
          data.error ??
            (res.status === 404
              ? "Conta não encontrada. Crie seu cadastro primeiro."
              : "Não foi possível enviar o código."),
        );
        return;
      }
      sessionStorage.setItem("motoboy-phone", digits);
      sessionStorage.removeItem("motoboy-auth-mode");
      router.push(`/verify?phone=${encodeURIComponent(digits)}`);
    } catch {
      setError("Não foi possível enviar o código. Tente de novo.");
    } finally {
      setCodeLoading(false);
    }
  }

  async function enterDemo() {
    setDemoLoading(true);
    setError("");
    const result = await signIn("demo", { redirect: false });
    setDemoLoading(false);
    if (result?.error) {
      setError("Modo demonstração indisponível.");
      return;
    }
    router.push("/");
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Use o WhatsApp e a senha definidos no cadastro."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Seu número de WhatsApp
          </label>
          <Input
            inputMode="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            maxLength={16}
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Senha
          </label>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {info && <p className="text-sm text-amber-200/90">{info}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || codeLoading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-emerald-500/40"
          disabled={loading || codeLoading}
          onClick={() => void loginWithWhatsAppCode()}
        >
          {codeLoading ? "Enviando código..." : "Entrar com código no WhatsApp"}
        </Button>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Conta antiga sem senha? Use o código no WhatsApp ou peça ao suporte para
          definir uma senha no painel admin.
        </p>
        {demoLoginAllowed && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            disabled={demoLoading || loading}
            onClick={enterDemo}
          >
            {demoLoading ? "Abrindo..." : "Ver app com dados de exemplo"}
          </Button>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Primeira vez?{" "}
          <Link href="/cadastro" className="text-emerald-400 underline">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="Entrar" subtitle="Carregando..." />}>
      <LoginPageInner />
    </Suspense>
  );
}
