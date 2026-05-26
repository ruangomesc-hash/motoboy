"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import { maskPhone } from "@/lib/phone-mask";
import {
  normalizeAffiliateCode,
  persistAffiliateCode,
  readAffiliateFromUrl,
  readPersistedAffiliateCode,
} from "@/lib/affiliate-ref";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponHint, setCouponHint] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromUrl = readAffiliateFromUrl(searchParams);
    const fromStorage = readPersistedAffiliateCode();
    const initial = fromUrl ?? fromStorage ?? "";
    if (initial) {
      setCoupon(initial);
      persistAffiliateCode(initial);
      void validateCoupon(initial);
    }
  }, [searchParams]);

  async function validateCoupon(code: string) {
    const normalized = normalizeAffiliateCode(code);
    if (normalized.length < 2) {
      setCouponHint(null);
      setCouponError("");
      return false;
    }
    try {
      const res = await fetch(
        `/api/backend/auth/affiliate/validate?code=${encodeURIComponent(normalized)}`,
      );
      const data = (await res.json()) as {
        valid?: boolean;
        name?: string | null;
        error?: string;
      };
      if (data.valid && data.name) {
        setCouponHint(`Indicação: ${data.name}`);
        setCouponError("");
        return true;
      }
      setCouponHint(null);
      setCouponError("Cupom inválido ou inativo");
      return false;
    } catch {
      setCouponHint(null);
      setCouponError("");
      return true;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCouponError("");
    try {
      const digits = phone.replace(/\D/g, "");
      const affiliateCode = coupon.trim()
        ? normalizeAffiliateCode(coupon)
        : undefined;

      if (affiliateCode) {
        const ok = await validateCoupon(affiliateCode);
        if (!ok) {
          setLoading(false);
          return;
        }
        persistAffiliateCode(affiliateCode);
      }

      const res = await fetch("/api/backend/auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: digits,
          name: name.trim(),
          email: email.trim(),
          affiliateCode,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o código.");
        return;
      }
      sessionStorage.setItem("motoboy-phone", digits);
      sessionStorage.setItem("motoboy-name", name.trim());
      sessionStorage.setItem("motoboy-email", email.trim());
      sessionStorage.setItem("motoboy-auth-mode", "register");
      if (affiliateCode) {
        persistAffiliateCode(affiliateCode);
      }
      router.push("/verify");
    } catch {
      setError("Não foi possível enviar o código. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Nome, e-mail e WhatsApp — depois confirmamos com um código."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Seu nome
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como você se chama"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            E-mail
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            WhatsApp
          </label>
          <Input
            inputMode="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            autoComplete="tel"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Cupom de indicação (opcional)
          </label>
          <Input
            value={coupon}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/\s/g, "");
              setCoupon(v);
              setCouponError("");
              setCouponHint(null);
            }}
            onBlur={() => {
              if (coupon.trim()) void validateCoupon(coupon);
            }}
            placeholder="Ex: JOAO10"
            autoComplete="off"
          />
          {couponHint && (
            <p className="text-xs text-emerald-400 mt-1">{couponHint}</p>
          )}
          {couponError && (
            <p className="text-xs text-destructive mt-1">{couponError}</p>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Enviando..." : "Receber código no WhatsApp"}
        </Button>
        <p className="text-center text-sm text-muted-foreground pt-1">
          Já tem conta?{" "}
          <Link href="/login" className="text-emerald-400 underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Criar conta" subtitle="Carregando...">
          <p className="text-sm text-muted-foreground text-center">Aguarde</p>
        </AuthShell>
      }
    >
      <CadastroForm />
    </Suspense>
  );
}
