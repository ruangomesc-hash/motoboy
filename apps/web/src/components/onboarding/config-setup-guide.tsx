"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CoachBackdrop, CoachMark } from "./coach-mark";

const STEPS = [
  {
    id: "welcome",
    target: null as string | null,
    title: "Bem-vindo ao Motocopiloto",
    body: (
      <>
        <p>
          Antes de ver seu lucro do dia, vamos configurar seu perfil uma única vez.
          Isso deixa metas e o resumo do dia certinhos.
        </p>
        <p className="text-emerald-400/90 text-xs">
          Leva cerca de 2 minutos.
        </p>
      </>
    ),
  },
  {
    id: "profile",
    target: "onboarding-profile",
    title: "Seu perfil",
    body: (
      <>
        <p>
          Preencha <strong>nome</strong> e <strong>e-mail</strong>, marque os{" "}
          <strong>apps</strong> em que você trabalha (iFood, 99, etc.) e os{" "}
          <strong>dias da semana</strong> que costuma rodar.
        </p>
        <p>Usamos isso para dividir sua meta mensal em meta de semana e do dia.</p>
      </>
    ),
  },
  {
    id: "goals",
    target: "onboarding-goals",
    title: "Meta mensal",
    body: (
      <>
        <p>
          Defina quanto você quer <strong>faturar no mês</strong>. O app calcula
          automaticamente quanto falta por semana e por dia útil.
        </p>
      </>
    ),
  },
  {
    id: "fuel",
    target: "onboarding-fuel",
    title: "Gasolina do dia",
    body: (
      <>
        <p>
          Para descontar combustível no lucro, mande no <strong>WhatsApp</strong>{" "}
          a foto do cupom ou escreva, por exemplo: &quot;abasteci 40 reais 6
          litros&quot;.
        </p>
        <p className="text-xs">
          Despesas como lanche ou estacionamento você registra como entrega com
          valor negativo na lista.
        </p>
      </>
    ),
  },
  {
    id: "save",
    target: "onboarding-save",
    title: "Salvar e começar",
    body: (
      <>
        <p>
          Toque em <strong>Salvar configurações</strong> no final da página. Depois
          disso mostramos como usar cada aba do app.
        </p>
      </>
    ),
  },
] as const;

export function ConfigSetupGuide({
  active,
  onFinished,
  allowSkip = true,
}: {
  active: boolean;
  onFinished: () => void;
  /** false = obrigatório até salvar config no servidor */
  allowSkip?: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const wasActive = useRef(false);
  const step = STEPS[stepIndex]!;
  const total = STEPS.length;

  const scrollToTarget = useCallback((targetId: string | null) => {
    if (!targetId) return;
    requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  useEffect(() => {
    if (active && !wasActive.current) setStepIndex(0);
    wasActive.current = active;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    scrollToTarget(step.target);
    const targets = [
      "onboarding-profile",
      "onboarding-goals",
      "onboarding-fuel",
      "onboarding-save",
    ];
    for (const id of targets) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.remove("ring-2", "ring-emerald-400/80", "ring-offset-2", "ring-offset-background");
    }
    if (step.target) {
      document
        .getElementById(step.target)
        ?.classList.add(
          "ring-2",
          "ring-emerald-400/80",
          "ring-offset-2",
          "ring-offset-background",
        );
    }
    return () => {
      for (const id of targets) {
        document.getElementById(id)?.classList.remove(
          "ring-2",
          "ring-emerald-400/80",
          "ring-offset-2",
          "ring-offset-background",
        );
      }
    };
  }, [active, step.target, stepIndex, scrollToTarget]);

  if (!active) return null;

  return (
    <>
      <CoachBackdrop open />
      <CoachMark
        open
        title={step.title}
        step={stepIndex + 1}
        totalSteps={total}
        showBack={stepIndex > 0}
        onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
        onSkip={allowSkip ? onFinished : undefined}
        nextLabel={stepIndex === total - 1 ? "Entendi" : "Próximo"}
        onNext={() => {
          if (stepIndex >= total - 1) {
            onFinished();
            return;
          }
          setStepIndex((i) => i + 1);
        }}
      >
        {step.body}
      </CoachMark>
    </>
  );
}
