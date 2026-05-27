"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/brand/auth-shell";
import { maskPhone } from "@/lib/phone-mask";
import {
  normalizeAffiliateCode,
  persistAffiliateCode,
  readAffiliateFromUrl,
  readPersistedAffiliateCode,
  clearPersistedAffiliateCode,
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
      return true;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      setLoading(false);
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setError("Informe seu nome completo.");
      setLoading(false);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Informe um e-mail válido.");
      setLoading(false);
      return;
    }
    try {
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
      const result = await signIn("whatsapp", {
        phone: digits,
        code: "000000",
        name: name.trim(),
        email: email.trim(),
        affiliateCode: affiliateCode ?? "",
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      clearPersistedAffiliateCode();
      router.push("/config?setup=1");
    } catch {
      setError("Não foi possível concluir o cadastro. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Preencha seus dados e entre direto no app — sem código no primeiro acesso."
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
            required
            minLength={2}
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
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Cupom de indicação (opcional)
          </label>
          <Input
            value={coupon}
            onChange={(e) =>
              setCoupon(e.target.value.toUpperCase().replace(/\s/g, ""))
            }
            onBlur={() => {
              if (coupon.trim()) void validateCoupon(coupon);
            }}
            placeholder="Ex: JOAO10"
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
          {loading ? "Criando conta..." : "Criar conta e entrar"}
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
