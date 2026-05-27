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
  migrationsReady: boolean;
  envLoginAvailable: boolean;
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
        if (!data.migrationsReady && data.envLoginAvailable) {
          setPhase("login");
          return;
        }
        setPhase(data.configured ? "login" : "first");
      })
      .catch(() =>
        setError(
          "Não foi possível conectar à API. Confira o deploy e DATABASE_URL na Vercel.",
        ),
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
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
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

  const migrationsReady = status?.migrationsReady ?? true;
  const configured = status?.configured ?? false;
  const envLogin = status?.envLoginAvailable ?? false;
  const showSetup = migrationsReady && !configured && phase === "setup";
  const showFirst = migrationsReady && !configured && phase === "first";
  const showLogin =
    configured || (!migrationsReady && envLogin) || phase === "login";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        {!migrationsReady && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100/90 space-y-2">
            <p className="font-medium">Banco sem tabela do admin</p>
            <p className="text-amber-100/70 text-xs leading-relaxed">
              Na Vercel: marque <strong>DATABASE_URL</strong> e{" "}
              <strong>DIRECT_URL</strong> em Production e em{" "}
              <strong>Build</strong>, depois Redeploy sem cache. Ou no Mac, com
              o .env do Supabase:{" "}
              <code className="text-[11px]">bash scripts/setup-supabase.sh</code>
            </p>
            {envLogin && (
              <p className="text-xs text-emerald-200/90">
                Enquanto isso, use o e-mail e a senha definidos em ADMIN_EMAIL /
                ADMIN_PASSWORD na Vercel.
              </p>
            )}
          </div>
        )}

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
                : !migrationsReady && envLogin
                  ? "Entre com ADMIN_EMAIL e ADMIN_PASSWORD (Vercel)."
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
          {showLogin && (
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
          {showLogin && !showFirst && !showSetup && (
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
