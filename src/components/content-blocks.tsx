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
 * `<Glossary term="Invariante" text="..." />`. O texto vai em atributo, não em filhos,
 * porque o painel é inline (fica dentro de um parágrafo).
 */
export function Glossary({ term, text }: { term: string; text: string }) {
  return (
    <p>
      <span className="glossary">
        <button
          type="button"
          className="underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {term}
        </button>
        <span className="glossary-panel" role="tooltip">
          {text}
        </span>
      </span>
    </p>
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
