"use client";

import { useState } from "react";

const GAPS: Record<string, string> = {
  httponly: "HttpOnly ainda está desligado, então o script da página continua lendo a chave.",
  secure: "Secure ainda está desligado, então a chave ainda pode sair sem HTTPS.",
  samesite: "SameSite precisa ser Lax ou Strict. None deixa a chave sair em pedido de outro site.",
  rotate: "A chave do login continua a mesma. Troque no momento em que a pessoa entra.",
  logout: "O logout ainda não apaga o registro no servidor.",
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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <p className="mt-3 font-mono text-sm text-text">
          sessao=chave-nova; HttpOnly; Secure; SameSite=Lax
        </p>
        <ul className="mt-4 space-y-2 text-sm text-text">
          <li>O script da página não lê a chave.</li>
          <li>Sem HTTPS, o navegador não envia a chave.</li>
          <li>No login a chave muda. No logout o registro some.</li>
        </ul>
      </section>
    );
  }

  return (
    <form action="/api/trilha/sessao-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Cookie do lab</p>
        <p className="mt-3 break-all font-mono text-sm text-text">
          sessao={rotate ? "chave-nova" : "chave-da-alice"}
          {marks.length > 0 ? `; ${marks.join("; ")}` : ""}
        </p>
        <p className="mt-2 text-xs text-muted">
          {logout ? "Logout apaga o registro no servidor." : "Logout ainda deixa o registro vivo."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{GAPS[key] ?? "Falta uma defesa."}</li>
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
        HttpOnly — o script da página não lê a chave
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
        Secure — a chave só viaja em HTTPS
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm">SameSite</legend>
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
        Trocar a chave no login
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
        Apagar o registro no logout
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir a chave
      </button>
    </form>
  );
}
