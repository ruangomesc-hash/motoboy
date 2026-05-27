"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  LogOut,
  Bike,
  AlertTriangle,
  ScrollText,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDemoBanner } from "@/components/admin/admin-demo-banner";
import { AdminTrialPolicyBar } from "@/components/admin/admin-trial-policy-bar";

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, short: "Início" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, short: "Clientes" },
  {
    href: "/admin/afiliados",
    label: "Afiliados",
    icon: Trophy,
    short: "Afiliados",
  },
  {
    href: "/admin/inadimplentes",
    label: "Inadimplentes",
    icon: AlertTriangle,
    short: "Atraso",
  },
  { href: "/admin/logs", label: "Logs", icon: ScrollText, short: "Logs" },
  { href: "/admin/regioes", label: "Regiões", icon: MapPin, short: "Regiões" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full min-w-0 w-full max-w-full overflow-hidden">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#061210] p-4">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <Bike className="h-6 w-6 text-emerald-400" strokeWidth={1.75} />
          <div>
            <p className="font-semibold text-sm">Motocopiloto</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Painel do dono
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, short, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground mt-4"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <AdminDemoBanner />
        <AdminTrialPolicyBar />
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 flex border-t border-white/10 bg-[#061210] safe-area-pb">
        {NAV.map(({ href, short, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px]",
                active ? "text-emerald-400" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
