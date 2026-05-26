"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import { maskPhone } from "@/lib/phone-mask";

const skipAuthCodeAllowed =
  process.env.NEXT_PUBLIC_ALLOW_SKIP_AUTH_CODE === "true";

const demoLoginAllowed =
  process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === "true";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeFlowLoading, setCodeFlowLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  async function enterWithPhone() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    setLoading(true);
    setError("");

    if (skipAuthCodeAllowed) {
      const result = await signIn("whatsapp", {
        phone: digits,
        code: "000000",
        redirect: false,
      });
      setLoading(false);
      if (result?.error) {
        setError(
          "Conta não encontrada. Crie seu cadastro em Criar conta com nome e e-mail.",
        );
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    setCodeFlowLoading(true);
    try {
      const res = await fetch("/api/backend/auth/whatsapp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(
          data.error ??
            "Não foi possível enviar o código. Crie sua conta se for a primeira vez.",
        );
        return;
      }
      sessionStorage.setItem("motoboy-phone", digits);
      sessionStorage.removeItem("motoboy-name");
      sessionStorage.removeItem("motoboy-email");
      sessionStorage.setItem("motoboy-auth-mode", "login");
      router.push("/verify");
    } catch {
      setError("Não foi possível enviar o código. Tente de novo.");
    } finally {
      setLoading(false);
      setCodeFlowLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await enterWithPhone();
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
    router.refresh();
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle={
        skipAuthCodeAllowed
          ? "Use o WhatsApp da sua conta. Primeira vez? Faça o cadastro completo."
          : "Use o WhatsApp da sua conta. Primeira vez? Crie o cadastro."
      }
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
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || codeFlowLoading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        {!skipAuthCodeAllowed && (
          <p className="text-xs text-center text-muted-foreground">
            Enviaremos um código no WhatsApp para confirmar.
          </p>
        )}
        {!skipAuthCodeAllowed && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={codeFlowLoading || loading}
            onClick={enterWithPhone}
          >
            {codeFlowLoading ? "Enviando..." : "Receber código no WhatsApp"}
          </Button>
        )}
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
