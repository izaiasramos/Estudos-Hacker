"use client";

import { useState } from "react";
import { XSS_LAB_GAPS } from "@/lib/xss-lab-check";

export function XssDefenseLab({
  done,
  missing,
}: {
  done: boolean;
  missing: string[];
}) {
  const [escape, setEscape] = useState(false);
  const [csp, setCsp] = useState(false);
  const [safeDom, setSafeDom] = useState(false);
  const [sanitize, setSanitize] = useState(false);

  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Simulação concluída</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Saída tratada conforme o contexto em que será inserida.</li>
          <li>Texto entra no DOM como texto, sem interpretação de HTML.</li>
          <li>HTML rico passa por sanitizador com lista permitida.</li>
          <li>CSP restringe scripts como camada adicional de contenção.</li>
        </ul>
      </section>
    );
  }

  const preview = safeDom
    ? "Comentário: <img ...> (os caracteres aparecem como texto)"
    : "Comentário entregue a uma API que interpreta HTML";

  return (
    <form action="/api/trilha/xss-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Simulação de configuração · painel</p>
        <p className="mt-3 text-sm text-text">{preview}</p>
        <p className="mt-2 text-xs text-muted">
          {escape ? "Saída adequada ao contexto." : "Saída ainda mistura dado e marcação."}
          {" · "}
          {csp ? "CSP restringe scripts autorizados." : "Sem camada adicional de CSP."}
          {" · "}
          {sanitize ? "HTML rico passa por lista permitida." : "HTML rico ainda aceita qualquer construção."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{XSS_LAB_GAPS[key] ?? "Revise a fronteira entre dado e código."}</li>
          ))}
        </ul>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="escape" value="on" checked={escape} onChange={(event) => setEscape(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Tratar a saída conforme o contexto — texto, atributo ou URL
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="csp" value="on" checked={csp} onChange={(event) => setCsp(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Adicionar CSP — restringir scripts como contenção, sem substituir as outras defesas
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="safedom" value="on" checked={safeDom} onChange={(event) => setSafeDom(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Usar DOM seguro para texto — textContent ou interpolação segura, não innerHTML
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="sanitize" value="on" checked={sanitize} onChange={(event) => setSanitize(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Sanitizar o HTML rico — manter somente tags e atributos permitidos
      </label>
      <button type="submit" className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
        Conferir decisões
      </button>
    </form>
  );
}
