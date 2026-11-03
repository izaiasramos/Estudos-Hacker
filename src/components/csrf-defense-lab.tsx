"use client";

import { useState } from "react";
import { CSRF_LAB_GAPS } from "@/lib/csrf-lab-check";

export function CsrfDefenseLab({
  done,
  missing,
}: {
  done: boolean;
  missing: string[];
}) {
  const [token, setToken] = useState(false);
  const [origin, setOrigin] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [sameSite, setSameSite] = useState("none");

  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Simulação concluída</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Um token anti-CSRF acompanha o pedido e o servidor confere.</li>
          <li>Cookie de sessão usa SameSite Lax ou Strict neste cenário.</li>
          <li>O cabeçalho Origin (ou Referer, se faltar) é comparado com o endereço esperado.</li>
          <li>GET só lê dados. A ação que altera dados usa POST, junto com as outras proteções.</li>
        </ul>
      </section>
    );
  }

  const methodPreview = postOnly
    ? "POST /transferir"
    : "GET /transferir?para=… ainda altera estado";

  return (
    <form action="/api/trilha/csrf-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Simulação de configuração · transferência</p>
        <p className="mt-3 text-sm text-text">{methodPreview}</p>
        <p className="mt-2 text-xs text-muted">
          {token ? "Token anti-CSRF validado." : "Nada prova que o pedido veio do seu formulário."}
          {" · "}
          {origin ? "Origem comparada à esperada." : "Procedência do pedido não conferida."}
          {" · "}
          SameSite={sameSite === "none" ? "None" : sameSite === "strict" ? "Strict" : "Lax"}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{CSRF_LAB_GAPS[key] ?? "Revise como esta configuração confirma que o pedido foi intencional."}</li>
          ))}
        </ul>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="token" value="on" checked={token} onChange={(event) => setToken(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Validar token anti-CSRF — valor imprevisível associado ao fluxo legítimo
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm">SameSite no cookie de sessão</legend>
        {[["none", "None"], ["lax", "Lax"], ["strict", "Strict"]].map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 text-sm">
            <input type="radio" name="samesite" value={value} checked={sameSite === value} onChange={() => setSameSite(value)} className="accent-[#d6ff4a]" />
            {label}
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="origin" value="on" checked={origin} onChange={(event) => setOrigin(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Conferir Origin e política de Referer — aceitar somente origens esperadas
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="postonly" value="on" checked={postOnly} onChange={(event) => setPostOnly(event.target.checked)} className="mt-1 accent-[#d6ff4a]" />
        Manter GET sem efeitos — usar POST protegido para a mutação
      </label>
      <button type="submit" className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
        Conferir decisões
      </button>
    </form>
  );
}
