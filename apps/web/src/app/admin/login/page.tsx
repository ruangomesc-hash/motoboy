"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bike, Monitor } from "lucide-react";

const adminDevAllowed =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN === "true";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function submit(e: React.FormEvent) {
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

  async function enterPreview() {
    setPreviewLoading(true);
    setError("");
    const res = await signIn("admin-dev", { redirect: false });
    setPreviewLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 safe-area-pb">
      <div className="w-full max-w-md space-y-4">
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-white/10 bg-[#0a0f0d]/95 p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 justify-center mb-1">
            <Bike className="h-8 w-8 text-emerald-400 shrink-0" />
            <h1 className="text-xl font-bold">Painel do dono</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center pb-1">
            Acesso restrito à administração do Motocopiloto
          </p>
          <div>
            <label className="text-sm text-muted-foreground">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {adminDevAllowed && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Sem API ou banco? Entre no painel com dados de exemplo para
              validar layout e fluxos antes de publicar.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
              disabled={previewLoading}
              onClick={enterPreview}
            >
              <Monitor className="h-4 w-4 mr-2 shrink-0" strokeWidth={1.75} />
              {previewLoading
                ? "Abrindo preview..."
                : "Explorar painel (sem API)"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
