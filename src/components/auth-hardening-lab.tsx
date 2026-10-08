"use client";

import { useState } from "react";
import { AUTH_LAB_GAPS } from "@/lib/auth-lab-check";

export function AuthHardeningLab({
  done,
  missing,
}: {
  done: boolean;
  missing: string[];
}) {
  const [hash, setHash] = useState(false);
  const [generic, setGeneric] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [limit, setLimit] = useState(false);

  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Senha armazenada como hash bcrypt.</li>
          <li>Resposta única: “E-mail ou senha inválidos”.</li>
          <li>Cadastro recusa senhas curtas e comuns.</li>
          <li>Após falhas repetidas, login desacelera.</li>
        </ul>
      </section>
    );
  }

  return (
    <form action="/api/trilha/autenticacao-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">POST /login (lab)</p>
        <p className="mt-3 font-mono text-sm text-text">
          {hash ? "password_hash=bcrypt(...)" : "password_plain=***"}
        </p>
        <p className="mt-2 text-xs text-muted">
          {generic
            ? "Resposta: E-mail ou senha inválidos."
            : "Resposta: distingue e-mail inexistente de senha errada."}
        </p>
        <p className="mt-1 text-xs text-muted">
          {policy ? "Cadastro: política mínima ativa." : "Cadastro: aceita senha123."}
          {" · "}
          {limit ? "Tentativas: limitadas." : "Tentativas: ilimitadas."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{AUTH_LAB_GAPS[key] ?? "Falta uma defesa."}</li>
          ))}
        </ul>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="hash"
          value="on"
          checked={hash}
          onChange={(event) => setHash(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Hash bcrypt — nunca guardar senha em texto puro
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="generic"
          value="on"
          checked={generic}
          onChange={(event) => setGeneric(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Mensagem genérica — mesma resposta para e-mail ou senha inválidos
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="policy"
          value="on"
          checked={policy}
          onChange={(event) => setPolicy(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Política no cadastro — tamanho mínimo e bloqueio de senhas comuns
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="limit"
          value="on"
          checked={limit}
          onChange={(event) => setLimit(event.target.checked)}
          className="mt-1 accent-[#d6ff4a]"
        />
        Limite de tentativas — desacelerar logins falhos repetidos
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir o login
      </button>
    </form>
  );
}
