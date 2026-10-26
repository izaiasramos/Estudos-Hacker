"use client";

import type { ReactNode } from "react";
import { InlineCode } from "@/components/inline-code";

/** Controles comuns dos labs de checklist (SSRF, upload). */
export function LabCheck({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        value="on"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 accent-[#d6ff4a]"
      />
      <span>{children}</span>
    </label>
  );
}

export function LabRadio({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm">{legend}</legend>
      {options.map(([option, label]) => (
        <label key={option} className="flex items-center gap-3 text-sm">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="accent-[#d6ff4a]"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

export function LabGaps({ missing, gaps }: { missing: string[]; gaps: Record<string, string> }) {
  if (missing.length === 0) return null;
  return (
    <ul className="space-y-2 text-sm text-danger" role="alert">
      {missing.map((key) => (
        <li key={key}>
          <InlineCode text={gaps[key] ?? "Falta uma defesa."} />
        </li>
      ))}
    </ul>
  );
}

export function LabDone({ items }: { items: string[] }) {
  return (
    <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
      <ul className="mt-3 space-y-2 text-sm text-text">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function LabSubmit() {
  return (
    <button
      type="submit"
      className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    >
      Conferir defesas
    </button>
  );
}

/** Tabela "entrada → o que o servidor faz", com a linha em vermelho quando vaza. */
export function LabOutcomes({ title, rows }: { title: string; rows: { input: string; result: string; bad: boolean }[] }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
      <ul className="mt-3 space-y-2 font-mono text-[12px]">
        {rows.map((row) => (
          <li key={row.input} className={row.bad ? "text-danger" : "text-defense"}>
            <span className="text-text">{row.input}</span>
            <span className="block pl-4">→ {row.result}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
