export function OrdersPreview() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <section className="rounded-[16px] border border-white/10 bg-ink p-4" aria-label="App do lab">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Pizzaria do Lab</p>
        <p className="mt-3 text-sm text-text">Alice · alice@lab.local</p>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li className="rounded-xl border border-white/10 px-3 py-2">Mussarela</li>
          <li className="rounded-xl border border-white/10 px-3 py-2">Calabresa</li>
        </ul>
      </section>
      <section className="rounded-[16px] border border-danger/40 bg-ink p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-danger">Checker</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A listagem devolveu também o pedido do Bruno. As funções findUser e listOrders
          colam o email no texto da consulta.
        </p>
      </section>
    </div>
  );
}
