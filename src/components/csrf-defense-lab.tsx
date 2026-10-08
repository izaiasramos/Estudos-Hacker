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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Token anti-CSRF em todo POST que muda estado.</li>
          <li>Cookie de sessão com SameSite Lax ou Strict.</li>
          <li>Origin/Referer conferidos no servidor.</li>
          <li>Mutação só via POST (ou verbos explícitos), nunca GET.</li>
        </ul>
      </section>
    );
  }

  return (
    <form action="/api/trilha/csrf-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Transferência (lab)</p>
        <p className="mt-3 text-sm text-text">
          {postOnly ? "POST /transferir + token" : "GET /transferir?para=… ainda aceito"}
        </p>
        <p className="mt-2 text-xs text-muted">
          {token ? "Token validado no servidor." : "Sem token — qualquer form externo replica o pedido."}
          {" · "}
          {origin ? "Origin checado." : "Origin ignorado."}
          {" · "}
          SameSite={sameSite === "none" ? "None" : sameSite === "strict" ? "Strict" : "Lax"}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{CSRF_LAB_GAPS[key] ?? "Falta uma defesa."}</li>
          ))}
        </ul>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="token"
          value="on"
          checked={token}
          onChange={(event) => setToken(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Token anti-CSRF — valor imprevisível validado a cada mutação
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm">SameSite no cookie de sessão</legend>
        {[
          ["none", "None"],
          ["lax", "Lax"],
          ["strict", "Strict"],
        ].map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="samesite"
              value={value}
              checked={sameSite === value}
              onChange={() => setSameSite(value)}
              className="accent-[#d6ff4a]"
            />
            {label}
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="origin"
          value="on"
          checked={origin}
          onChange={(event) => setOrigin(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Conferir Origin/Referer — recusar POST de outro site
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="postonly"
          value="on"
          checked={postOnly}
          onChange={(event) => setPostOnly(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Mutação só em POST — GET não altera estado
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir defesas
      </button>
    </form>
  );
}
