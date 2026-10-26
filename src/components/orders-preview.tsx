export function OrdersPreview() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <section
        className="rounded-[16px] border border-white/10 bg-ink p-4"
        aria-label="Resultado simulado da Pizzaria do Lab"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Resultado simulado
        </p>
        <p className="mt-3 text-sm text-text">Alice · alice@lab.local</p>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li className="rounded-xl border border-white/10 px-3 py-2">Mussarela · Alice</li>
          <li className="rounded-xl border border-danger/30 px-3 py-2 text-danger">
            Calabresa · Bruno
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Estes dados são fixos para o exercício; esta tela não executa uma consulta.
        </p>
      </section>
      <section className="rounded-[16px] border border-danger/40 bg-ink p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-danger">
          Inspeção fornecida
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          O resultado contradiz a regra: a lista de Alice inclui o pedido de Bruno. A inspeção
          textual preparada para o cenário aponta o mesmo padrão em <code>findUser</code> e{" "}
          <code>listOrders</code>: ambas concatenam <code>email</code> ao texto SQL.
        </p>
      </section>
    </div>
  );
}
