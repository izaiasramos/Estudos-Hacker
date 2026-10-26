"use client";

import { useState, type ReactNode } from "react";
import { InlineCode } from "@/components/inline-code";
import { HEADERS_LAB_GAPS } from "@/lib/headers-lab-check";

const CSP_OPTIONS = [
  ["none", "Sem CSP"],
  ["unsafe-inline", "script-src 'self' 'unsafe-inline'"],
  ["nonce", "script-src 'self' 'nonce-…' 'strict-dynamic'"],
] as const;

const FRAME_OPTIONS = [
  ["any", "Qualquer site pode enquadrar"],
  ["self", "frame-ancestors 'self'"],
  ["none", "frame-ancestors 'none'"],
] as const;

export function HeadersDefenseLab({ done, missing }: { done: boolean; missing: string[] }) {
  const [fields, setFields] = useState(false);
  const [errors, setErrors] = useState(false);
  const [powered, setPowered] = useState(false);
  const [csp, setCsp] = useState("none");
  const [hsts, setHsts] = useState(false);
  const [nosniff, setNosniff] = useState(false);
  const [frame, setFrame] = useState("any");

  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>O JSON só traz os campos que a tela usa.</li>
          <li>Erro sai genérico; o detalhe fica no log.</li>
          <li>A resposta não anuncia framework nem versão.</li>
          <li>CSP com nonce, HSTS, nosniff e frame-ancestors restrito.</li>
        </ul>
      </section>
    );
  }

  // Resposta que a Alice receberia em GET /api/perfil com a configuração atual.
  const headerLines: { text: string; bad: boolean }[] = [{ text: "HTTP/1.1 200 OK", bad: false }];
  if (!powered) headerLines.push({ text: "X-Powered-By: Express 4.17.1", bad: true });
  if (csp === "unsafe-inline") headerLines.push({ text: "Content-Security-Policy: script-src 'self' 'unsafe-inline'", bad: true });
  if (csp === "nonce") {
    headerLines.push({
      text: `Content-Security-Policy: script-src 'self' 'nonce-…' 'strict-dynamic'${frame !== "any" ? `; frame-ancestors '${frame}'` : ""}`,
      bad: false,
    });
  } else if (frame !== "any") {
    headerLines.push({ text: `Content-Security-Policy: frame-ancestors '${frame}'`, bad: false });
  }
  if (hsts) headerLines.push({ text: "Strict-Transport-Security: max-age=63072000; includeSubDomains", bad: false });
  if (nosniff) headerLines.push({ text: "X-Content-Type-Options: nosniff", bad: false });

  const body = fields
    ? [`"id": 7,`, `"name": "Alice",`, `"email": "alice@lab.local"`].map((text) => ({ text, bad: false }))
    : [
        { text: `"id": 7,`, bad: false },
        { text: `"name": "Alice",`, bad: false },
        { text: `"email": "alice@lab.local",`, bad: false },
        { text: `"password_hash": "$2b$12$…",`, bad: true },
        { text: `"reset_token": "9f2c…"`, bad: true },
      ];
  const missingHeaders = [
    csp !== "nonce" ? "CSP com nonce" : null,
    !hsts ? "HSTS" : null,
    !nosniff ? "nosniff" : null,
    frame === "any" ? "frame-ancestors" : null,
  ].filter(Boolean);

  return (
    <form action="/api/trilha/headers-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Alice logada · GET /api/perfil
        </p>
        <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-6">
          {headerLines.map((line) => (
            <span key={line.text} className={`block ${line.bad ? "text-danger" : "text-text"}`}>
              {line.text}
            </span>
          ))}
          <span className="block text-muted">{"{"}</span>
          {body.map((line) => (
            <span key={line.text} className={`block pl-4 ${line.bad ? "text-danger" : "text-text"}`}>
              {line.text}
            </span>
          ))}
          <span className="block text-muted">{"}"}</span>
        </pre>
        <p className="mt-2 text-xs text-muted">
          {missingHeaders.length > 0 ? `Faltam: ${missingHeaders.join(", ")}.` : "Todos os headers de proteção no ar."}{" "}
          {errors ? "Erro: “Algo deu errado. Código 7f3a.”" : "Erro: pilha completa com caminho de arquivo e consulta."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>
              <InlineCode text={HEADERS_LAB_GAPS[key] ?? "Falta uma defesa."} />
            </li>
          ))}
        </ul>
      ) : null}

      <Check name="fields" checked={fields} onChange={setFields}>
        Lista permitida de campos — o servidor escolhe o que sai no JSON
      </Check>
      <Check name="errors" checked={errors} onChange={setErrors}>
        Erro genérico para o cliente — a pilha vai só para o log
      </Check>
      <Check name="powered" checked={powered} onChange={setPowered}>
        Remover <code className="font-mono text-[13px]">X-Powered-By</code>
      </Check>
      <Radio legend="Content-Security-Policy" name="csp" value={csp} onChange={setCsp} options={CSP_OPTIONS} />
      <Check name="hsts" checked={hsts} onChange={setHsts}>
        <code className="font-mono text-[13px]">Strict-Transport-Security</code> — só HTTPS neste domínio
      </Check>
      <Check name="nosniff" checked={nosniff} onChange={setNosniff}>
        <code className="font-mono text-[13px]">X-Content-Type-Options: nosniff</code>
      </Check>
      <Radio legend="Quem pode enquadrar a página" name="frame" value={frame} onChange={setFrame} options={FRAME_OPTIONS} />
      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir defesas
      </button>
    </form>
  );
}

function Check({
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

function Radio({
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
          <span className={option === "none" || option === "any" ? "" : "font-mono text-[13px]"}>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
