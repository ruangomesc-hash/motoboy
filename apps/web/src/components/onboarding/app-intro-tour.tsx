"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  Map,
  MessageCircle,
  Package,
  Settings,
  TrendingUp,
} from "lucide-react";
import { CoachBackdrop, CoachMark } from "./coach-mark";
import { markAppTourDone } from "@/lib/onboarding";

const TOUR_STEPS = [
  {
    title: "Seu lucro do dia",
    icon: Home,
    body: (
      <>
        <p>
          Na <strong>Home</strong>, o número grande é o <strong>lucro líquido de
          hoje</strong>: o que sobrou depois de gasolina, manutenção e outros custos.
        </p>
      </>
    ),
  },
  {
    title: "Resumo detalhado",
    icon: TrendingUp,
    body: (
      <>
        <p>
          Em <strong>Resumo do dia</strong>, toque em cada linha para ver detalhes:
          quanto entrou, gastos, km rodados e lucro por km.
        </p>
      </>
    ),
  },
  {
    title: "Registrar pelo WhatsApp",
    icon: MessageCircle,
    body: (
      <>
        <p>
          O botão verde abre o WhatsApp para mandar &quot;entrega 25 reais&quot;,
          foto do cupom ou hodômetro — sem precisar digitar no app.
        </p>
      </>
    ),
  },
  {
    title: "Aba Entregas",
    icon: Package,
    body: (
      <>
        <p>
          Em <strong>Entregas</strong> você vê o histórico e pode{" "}
          <strong>registrar manualmente</strong> quando não usar o Zap.
        </p>
      </>
    ),
  },
  {
    title: "Aba Rota",
    icon: Map,
    body: (
      <>
        <p>
          Em <strong>Rota</strong>, cole vários endereços e o app sugere a ordem
          melhor + link para o Google Maps.
        </p>
      </>
    ),
  },
  {
    title: "Aba Stats",
    icon: BarChart3,
    body: (
      <>
        <p>
          Em <strong>Stats</strong>, acompanhe semana/mês, inicie ou encerre{" "}
          <strong>turno</strong> e veja ganho por hora.
        </p>
      </>
    ),
  },
  {
    title: "Configurações",
    icon: Settings,
    body: (
      <>
        <p>
          Em <strong>Config</strong> você altera meta, custos e perfil quando
          quiser. Tudo que você salvou já está valendo.
        </p>
      </>
    ),
  },
] as const;

export function AppIntroTour({
  active,
  onClose,
}: {
  active: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const step = TOUR_STEPS[index]!;
  const Icon = step.icon;
  const total = TOUR_STEPS.length;

  function finish() {
    markAppTourDone();
    onClose();
    router.push("/");
  }

  if (!active) return null;

  return (
    <>
      <CoachBackdrop open />
      <CoachMark
        open
        title={step.title}
        step={index + 1}
        totalSteps={total}
        showBack={index > 0}
        onBack={() => setIndex((i) => Math.max(0, i - 1))}
        onSkip={finish}
        nextLabel={index === total - 1 ? "Começar a usar" : "Próximo"}
        onNext={() => {
          if (index >= total - 1) {
            finish();
            return;
          }
          setIndex((i) => i + 1);
        }}
      >
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-1">
          <Icon className="h-8 w-8 text-emerald-400 shrink-0" strokeWidth={1.75} />
          <div>{step.body}</div>
        </div>
      </CoachMark>
    </>
  );
}
