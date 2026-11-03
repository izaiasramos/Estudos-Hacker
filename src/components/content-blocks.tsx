import type { ReactNode } from "react";

export type CalloutTone = "conceito" | "analogia" | "armadilha" | "dev";

const CALLOUT: Record<CalloutTone, string> = {
  conceito: "Conceito",
  analogia: "Analogia",
  armadilha: "Armadilha comum",
  dev: "Como um dev vê isso",
};

/** `<Callout tone="dev">texto em markdown</Callout>` */
export function Callout({ tone, children }: { tone: CalloutTone; children: ReactNode }) {
  return (
    <aside className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
        {CALLOUT[tone] ?? CALLOUT.conceito}
      </p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </aside>
  );
}

/**
 * `<Glossary term="Salt" text="..." example="..." />`. Cartão com a palavra nova em linguagem
 * simples, sempre visível. Escreva o texto como se explicasse para alguém que nunca viu o termo.
 */
export function Glossary({ term, text, example }: { term: string; text: string; example?: string }) {
  return (
    <div className="my-5 rounded-[14px] border border-info/30 bg-info/5 px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-info">Palavra nova</p>
      <p className="mt-1 text-lg font-semibold text-text">{term}</p>
      <p className="mt-1 text-base leading-7 text-muted">{text}</p>
      {example ? (
        <p className="mt-2 text-base leading-7 text-muted">
          <span className="font-semibold text-text">Exemplo: </span>
          {example}
        </p>
      ) : null}
    </div>
  );
}

/** `<Code caption="...">` com um bloco ``` dentro. */
export function Code({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure>
      <figcaption className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {caption}
      </figcaption>
      {children}
    </figure>
  );
}
