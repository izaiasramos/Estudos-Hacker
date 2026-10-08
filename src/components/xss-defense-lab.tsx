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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Saída codificada para HTML.</li>
          <li>CSP restringe script inline e origens.</li>
          <li>Comentário entra como texto, não como markup.</li>
          <li>HTML rico passa por sanitizador allowlist.</li>
        </ul>
      </section>
    );
  }

  const preview = safeDom
    ? "Comentário: &lt;img ...&gt; (mostrado como texto)"
    : "Comentário renderizado como HTML vivo";

  return (
    <form action="/api/trilha/xss-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Painel de comentários (lab)</p>
        <p className="mt-3 text-sm text-text">{preview}</p>
        <p className="mt-2 text-xs text-muted">
          {escape ? "Encoder HTML ativo." : "Resposta ainda interpola HTML cru."}
          {" · "}
          {csp ? "CSP: script-src 'self'." : "CSP ausente."}
          {" · "}
          {sanitize ? "Sanitizer allowlist ligado." : "HTML do usuário sem filtro."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{XSS_LAB_GAPS[key] ?? "Falta uma defesa."}</li>
          ))}
        </ul>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="escape"
          value="on"
          checked={escape}
          onChange={(event) => setEscape(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Codificar saída — tratar dado do usuário como texto, não como markup
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="csp"
          value="on"
          checked={csp}
          onChange={(event) => setCsp(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Content-Security-Policy — limitar script inline e fontes externas
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="safedom"
          value="on"
          checked={safeDom}
          onChange={(event) => setSafeDom(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        DOM seguro — textContent (ou escape do framework), não innerHTML com input
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="sanitize"
          value="on"
          checked={sanitize}
          onChange={(event) => setSanitize(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Sanitizar HTML rico — allowlist quando markup é requisito de produto
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir o painel
      </button>
    </form>
  );
}
