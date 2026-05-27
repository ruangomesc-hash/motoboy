"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import { maskPhone } from "@/lib/phone-mask";
import { useAuthConfig } from "@/lib/use-auth-config";

const demoLoginAllowed =
  process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === "true";

type LoginMode = "whatsapp" | "password";

export default function LoginPage() {
  const router = useRouter();
  const { skipAuthCode, loaded } = useAuthConfig();
  const [mode, setMode] = useState<LoginMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  async function enterWithPhone() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    if (!skipAuthCode) {
      setError("Use a aba Com senha ou confirme o código no WhatsApp.");
      return;
    }
    setLoading(true);
    setError("");
    router.push(`/verify?phone=${encodeURIComponent(digits)}`);
    setLoading(false);
  }

  async function enterWithPassword() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "password") {
      await enterWithPassword();
    } else {
      await enterWithPhone();
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
      subtitle={
        mode === "password"
          ? "Use o WhatsApp e a senha definidos no cadastro."
          : "Entrada rápida só com o número (contas antigas)."
      }
    >
      <div className="flex gap-2 mb-1">
        <Button
          type="button"
          variant={mode === "password" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => {
            setMode("password");
            setError("");
          }}
        >
          Com senha
        </Button>
        {loaded && skipAuthCode && (
          <Button
            type="button"
            variant={mode === "whatsapp" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              setMode("whatsapp");
              setError("");
            }}
          >
            Código WhatsApp
          </Button>
        )}
      </div>

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
            required
          />
        </div>
        {mode === "password" && (
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
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
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
