"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bike, Monitor } from "lucide-react";

const adminDevAllowed =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN === "true";

type AdminAuthStatus = {
  configured: boolean;
  bootstrapEmail: string | null;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AdminAuthStatus | null>(null);
  const [phase, setPhase] = useState<"first" | "setup" | "login">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/backend/admin/auth/status")
      .then((r) => r.json())
      .then((data: AdminAuthStatus) => {
        setStatus(data);
        if (data.bootstrapEmail) setEmail(data.bootstrapEmail);
        setPhase(data.configured ? "login" : "first");
      })
      .catch(() =>
        setError("Não foi possível verificar o admin. Rode as migrations."),
      );
  }, []);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("admin", {
      email: email.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function submitSetup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/backend/admin/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar a senha.");
        setLoading(false);
        return;
      }
      const sign = await signIn("admin", {
        email: email.trim(),
        password,
        redirect: false,
      });
      setLoading(false);
      if (sign?.error) {
        setError(sign.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Erro de conexão.");
    }
  }

  const configured = status?.configured ?? false;
  const showSetup = !configured && phase === "setup";
  const showFirst = !configured && phase === "first";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <form
          onSubmit={
            showSetup
              ? submitSetup
              : showFirst
                ? (e) => {
                    e.preventDefault();
                    if (!email.trim()) {
                      setError("Informe o e-mail.");
                      return;
                    }
                    setError("");
                    setPhase("setup");
                  }
                : submitLogin
          }
          className="space-y-4 rounded-2xl border border-white/10 bg-[#0a0f0d]/95 p-6"
        >
          <div className="flex items-center gap-2 justify-center">
            <Bike className="h-8 w-8 text-emerald-400" />
            <h1 className="text-xl font-bold">Painel do dono</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {showFirst
              ? "Primeiro acesso: entre sem senha e defina a senha principal."
              : showSetup
                ? "Crie a senha que será usada daqui em diante."
                : "Acesso restrito ao Motocopiloto"}
          </p>
          <div>
            <label className="text-sm text-muted-foreground">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          {showSetup && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">
                  Nova senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Confirmar senha
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  minLength={8}
                  required
                />
              </div>
            </>
          )}
          {configured && (
            <div>
              <label className="text-sm text-muted-foreground">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          {showFirst && (
            <Button type="submit" className="w-full">
              Continuar sem senha
            </Button>
          )}
          {showSetup && (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar senha e entrar"}
            </Button>
          )}
          {configured && (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          )}
        </form>
        {adminDevAllowed && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={previewLoading}
            onClick={async () => {
              setPreviewLoading(true);
              const res = await signIn("admin-dev", { redirect: false });
              setPreviewLoading(false);
              if (!res?.error) router.push("/admin");
            }}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Explorar painel (sem API)
          </Button>
        )}
      </div>
    </div>
  );
}
