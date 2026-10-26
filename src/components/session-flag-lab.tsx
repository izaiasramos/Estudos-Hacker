"use client";

import { useState } from "react";

const GAPS: Record<string, string> = {
  httponly: "Na simulação, falta selecionar HttpOnly para impedir a leitura direta do cookie por JavaScript.",
  secure: "Na simulação, falta selecionar Secure para restringir o envio do cookie a HTTPS.",
  samesite: "Escolha SameSite=Lax ou Strict para o cenário. None permitiria envio entre sites.",
  rotate: "Falta decidir pela geração de uma nova chave quando o login termina.",
  logout: "Falta decidir pela invalidação da sessão no servidor durante o logout.",
};

export function SessionFlagLab({
  done,
  missing,
}: {
  done: boolean;
  missing: string[];
}) {
  const [httpOnly, setHttpOnly] = useState(false);
  const [secure, setSecure] = useState(false);
  const [sameSite, setSameSite] = useState("none");
  const [rotate, setRotate] = useState(false);
  const [logout, setLogout] = useState(false);

  const marks = [
    httpOnly ? "HttpOnly" : null,
    secure ? "Secure" : null,
    sameSite !== "none" ? `SameSite=${sameSite === "strict" ? "Strict" : "Lax"}` : null,
  ].filter(Boolean);

  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">
          Checklist simulado completo
        </p>
        <p className="mt-3 font-mono text-sm text-text">
          sessao=chave-nova; HttpOnly; Secure; SameSite=Lax ou Strict
        </p>
        <p className="mt-4 text-sm text-text">
          Você selecionou as decisões esperadas para este cenário:
        </p>
        <ul className="mt-2 space-y-2 text-sm text-text">
          <li>restringir a leitura do cookie por JavaScript e seu envio a HTTPS;</li>
          <li>limitar seu uso entre sites;</li>
          <li>trocar a chave no login e invalidá-la no logout.</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          O checker conferiu opções marcadas; não executou nem certificou uma aplicação real.
        </p>
      </section>
    );
  }

  return (
    <form action="/api/trilha/sessao-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Prévia da configuração simulada
        </p>
        <p className="mt-3 break-all font-mono text-sm text-text">
          sessao={rotate ? "chave-nova" : "chave-da-alice"}
          {marks.length > 0 ? `; ${marks.join("; ")}` : ""}
        </p>
        <p className="mt-2 text-xs text-muted">
          {logout
            ? "Decisão de logout: invalidar a sessão no servidor."
            : "Decisão de logout: a sessão ainda ficaria válida."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{GAPS[key] ?? "Falta uma decisão no checklist."}</li>
          ))}
        </ul>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="httponly"
          value="on"
          checked={httpOnly}
          onChange={(event) => setHttpOnly(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        HttpOnly — impedir a leitura direta do cookie por JavaScript
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="secure"
          value="on"
          checked={secure}
          onChange={(event) => setSecure(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Secure — enviar o cookie somente por HTTPS
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm">SameSite — limite de envio entre sites</legend>
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
          name="rotate"
          value="on"
          checked={rotate}
          onChange={(event) => setRotate(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Gerar uma nova chave no login e invalidar a anterior
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="logout"
          value="on"
          checked={logout}
          onChange={(event) => setLogout(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Invalidar a sessão no servidor durante o logout
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir decisões
      </button>
    </form>
  );
}
