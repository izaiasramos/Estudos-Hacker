"use client";

import { motion, useReducedMotionConfig } from "motion/react";

const STEPS = [
  { index: "01", title: "Compreenda", detail: "Conceito e contexto", tone: "accent" },
  { index: "02", title: "Experimente", detail: "Laboratório seguro", tone: "info" },
  { index: "03", title: "Corrija", detail: "Código e testes", tone: "defense" },
  { index: "04", title: "Evolua", detail: "Progresso reconhecido", tone: "accent" },
] as const;

export function TrailMap() {
  const reduce = useReducedMotionConfig() === true;

  return (
    <figure className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border border-line-strong bg-[linear-gradient(145deg,rgba(26,29,40,0.96),rgba(12,14,21,0.96))] p-5 shadow-[0_32px_90px_rgba(0,0,0,0.38)] sm:p-7">
      <div aria-hidden className="absolute -right-20 -top-20 size-56 rounded-full bg-info/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 -left-20 size-56 rounded-full bg-accent/10 blur-3xl" />
      <figcaption className="relative flex items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-sm font-semibold text-info">Uma trilha completa</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Você aprende fazendo</h2>
        </div>
        <span className="rounded-full border border-defense/25 bg-defense/10 px-3 py-1 text-xs font-semibold text-defense">Ambiente seguro</span>
      </figcaption>

      <ol className="relative mt-6 space-y-3" aria-label="Etapas da experiência de aprendizagem">
        {STEPS.map((step, index) => (
          <motion.li
            key={step.index}
            initial={reduce ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduce ? 0 : 0.42, delay: reduce ? 0 : index * 0.1 }}
            className="group relative flex items-center gap-4 rounded-2xl border border-line bg-ink/55 p-4"
          >
            {index < STEPS.length - 1 ? <span aria-hidden className="absolute left-[2.05rem] top-[3.55rem] h-6 w-px bg-gradient-to-b from-line-strong to-transparent" /> : null}
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl border font-mono text-sm font-bold ${toneClasses[step.tone]}`}>{step.index}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-text">{step.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{step.detail}</span>
            </span>
            <span aria-hidden className="text-lg text-muted">→</span>
          </motion.li>
        ))}
      </ol>

      <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/[0.07] p-4">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-bold text-ink">✓</span>
        <p className="text-sm leading-5 text-text"><strong className="font-semibold">Resultado:</strong> você entende o risco e sabe aplicar a proteção.</p>
      </div>
    </figure>
  );
}

const toneClasses = {
  accent: "border-accent/35 bg-accent/10 text-accent",
  info: "border-info/35 bg-info/10 text-info",
  defense: "border-defense/35 bg-defense/10 text-defense",
};
