import type { MDXComponents } from "mdx/types";
import { Callout, Code, Glossary } from "@/components/content-blocks";
import { DidacticTable } from "@/components/didactic-table";
import { Diagram } from "@/components/diagrams";
import { SecurityCodePractice } from "@/components/security-code-practice";
import { SecurityMicroPractice } from "@/components/security-micro-practice";
import { SecurityPractice } from "@/components/security-practice";
import { SqlDefensePractice } from "@/components/sql-defense-practice";
import { InlineMission } from "@/components/inline-mission";

// Componentes e estilos de todo .mdx do app (exigido pelo @next/mdx no App Router).
const components = {
  Callout,
  Code,
  Glossary,
  Diagram,
  DidacticTable,
  InlineMission,
  SecurityCodePractice,
  SecurityMicroPractice,
  SecurityPractice,
  SqlDefensePractice,
  ol: (props) => <ol {...props} className="list-decimal space-y-1 pl-6" />,
  ul: (props) => <ul {...props} className="list-disc space-y-1 pl-6" />,
  h2: (props) => <h2 {...props} className="mt-10 border-t border-white/10 pt-6 text-xl font-semibold tracking-tight text-text" />,
  pre: (props) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-[16px] border border-white/10 p-5 font-mono text-base font-semibold leading-7"
    />
  ),
  code: (props) => (
    <code {...props} className="rounded bg-white/5 px-1 font-mono text-[0.9em] [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-[1em]" />
  ),
  a: (props) => <a {...props} className="text-accent underline underline-offset-4" />,
  table: (props) => (
    <div className="content-table-wrap" tabIndex={0} role="region" aria-label="Tabela com rolagem horizontal">
      <table {...props} className="content-table" />
    </div>
  ),
  thead: (props) => <thead {...props} className="content-table-head" />,
  tbody: (props) => <tbody {...props} className="content-table-body" />,
  th: (props) => <th {...props} className="content-table-cell content-table-header" />,
  td: (props) => <td {...props} className="content-table-cell" />,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
