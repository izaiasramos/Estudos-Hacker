"use client";

import { useState, type ReactNode } from "react";
import { IDOR_LAB_GAPS } from "@/lib/idor-lab-check";

// Pedidos fictícios da Pizzaria do Lab (labs/pizzaria/fixture.json).
const ORDERS = [
  { id: 101, owner: "Alice", item: "Mussarela" },
  { id: 102, owner: "Alice", item: "Calabresa" },
  { id: 103, owner: "Bruno", item: "Portuguesa" },
];

const RESPONSES = [
  ["200", "200 com o pedido"],
  ["403", "403 Proibido"],
  ["404", "404 Não encontrado"],
] as const;

export function IdorDefenseLab({ done, missing }: { done: boolean; missing: string[] }) {
  const [owner, setOwner] = useState(false);
  const [server, setServer] = useState(false);
  const [deny, setDeny] = useState(false);
  const [allowlist, setAllowlist] = useState(false);
  const [uuid, setUuid] = useState(false);
  const [response, setResponse] = useState("200");

  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Consulta filtra pelo dono da sessão.</li>
          <li>Papel conferido no servidor, não só na interface.</li>
          <li>Rota nova nasce fechada.</li>
          <li>Só campos da lista permitida são gravados.</li>
          <li>Pedido de outra pessoa volta sem conteúdo.</li>
        </ul>
      </section>
    );
  }

  // O que a Alice, logada, recebe pedindo cada id com a configuração atual.
  const leaks = !owner;
  const brunoAnswer = leaks ? "200 · Portuguesa (do Bruno)" : response === "200" ? "200 · vazio, mas confirma que existe" : response;

  return (
    <form action="/api/trilha/controle-acesso-lab" method="post" className="mt-8 space-y-4">
      <div className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Alice logada · GET /pedidos/:id
        </p>
        <ul className="mt-3 space-y-1 font-mono text-[13px]">
          {ORDERS.map((order) => {
            const id = uuid ? `…${String(order.id * 7919).slice(-4)}` : String(order.id);
            const mine = order.owner === "Alice";
            return (
              <li key={order.id} className={mine ? "text-text" : leaks ? "text-danger" : "text-defense"}>
                /pedidos/{id} → {mine ? `200 · ${order.item}` : brunoAnswer}
              </li>
            );
          })}
        </ul>
        {uuid && leaks ? (
          <p className="mt-2 text-xs text-muted">
            O id ficou difícil de adivinhar, mas quem tiver o link do Bruno ainda abre o pedido.
          </p>
        ) : null}
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{IDOR_LAB_GAPS[key] ?? "Falta uma defesa."}</li>
          ))}
        </ul>
      ) : null}

      <Check name="owner" checked={owner} onChange={setOwner}>
        Filtrar pelo dono — <code className="font-mono text-[13px]">WHERE id = ? AND user_id = sessão</code>
      </Check>
      <Check name="server" checked={server} onChange={setServer}>
        Conferir o papel na rota, no servidor — não só esconder o botão
      </Check>
      <Check name="deny" checked={deny} onChange={setDeny}>
        Negar por padrão — rota nova começa fechada
      </Check>
      <Check name="allowlist" checked={allowlist} onChange={setAllowlist}>
        Lista permitida de campos — ignorar <code className="font-mono text-[13px]">role</code> e{" "}
        <code className="font-mono text-[13px]">userId</code> vindos do corpo
      </Check>
      <Check name="uuid" checked={uuid} onChange={setUuid}>
        Trocar o id sequencial por UUID
      </Check>
      <fieldset className="space-y-2">
        <legend className="text-sm">Resposta para pedido de outra pessoa</legend>
        {RESPONSES.map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="response"
              value={value}
              checked={response === value}
              onChange={() => setResponse(value)}
              className="accent-[#d6ff4a]"
            />
            {label}
          </label>
        ))}
      </fieldset>
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
