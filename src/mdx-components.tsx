import type { MDXComponents } from "mdx/types";
import { Callout, Code, Glossary } from "@/components/content-blocks";

// Componentes e estilos de todo .mdx do app (exigido pelo @next/mdx no App Router).
const components = {
  Callout,
  Code,
  Glossary,
  pre: (props) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-[16px] border border-white/10 bg-ink p-4 font-mono text-[13px] leading-6 text-text"
    />
  ),
  code: (props) => (
    <code {...props} className="rounded bg-white/5 px-1 font-mono text-[0.9em] [pre_&]:bg-transparent [pre_&]:p-0" />
  ),
  a: (props) => <a {...props} className="text-accent underline underline-offset-4" />,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
