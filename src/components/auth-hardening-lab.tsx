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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">
          Checklist simulado completo
        </p>
        <p className="mt-3 text-sm text-text">
          Você selecionou as quatro decisões deste checklist simulado:
        </p>
        <ul className="mt-2 space-y-2 text-sm text-text">
          <li>armazenar senhas com algoritmo próprio para hash de senha;</li>
          <li>manter mensagem e status coerentes para qualquer credencial inválida;</li>
          <li>recusar senhas curtas e comuns no cadastro;</li>
          <li>limitar tentativas falhas repetidas.</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          O checker conferiu opções marcadas; não executou hash nem testou um endpoint real.
        </p>
      </section>
    );
  }

  return (
    <form action="/api/trilha/autenticacao-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Prévia do login simulado
        </p>
        <p className="mt-3 font-mono text-sm text-text">
          {hash ? "armazenamento=hash_para_senha" : "armazenamento=texto_puro"}
        </p>
        <p className="mt-2 text-xs text-muted">
          {generic
            ? "Resposta escolhida: E-mail ou senha inválidos."
            : "Resposta escolhida: distingue e-mail inexistente de senha errada."}
        </p>
        <p className="mt-1 text-xs text-muted">
          {policy ? "Cadastro: política mínima selecionada." : "Cadastro: aceitaria senha123."}
          {" · "}
          {limit ? "Tentativas: limite selecionado." : "Tentativas: sem limite."}
        </p>
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{AUTH_LAB_GAPS[key] ?? "Falta uma decisão no checklist."}</li>
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
        Hash de senha — usar bcrypt, scrypt ou Argon2 com salt e custo adequados
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
        Resposta coerente — mesma mensagem e mesmo status para credenciais inválidas
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
        Política de cadastro — tamanho mínimo e bloqueio de senhas comuns
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
        Rate limiting — desacelerar tentativas falhas repetidas
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
