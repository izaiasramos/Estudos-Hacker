"use client";

import { useState } from "react";

export function PizzariaLabApp() {
  const [name, setName] = useState<string | null>(null);
  const [orders, setOrders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setOrders([]);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const login = await fetch("/lab/pizzaria/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!login.ok) {
      setName(null);
      setError("E-mail ou senha do lab não conferem.");
      setPending(false);
      return;
    }
    const user = (await login.json()) as { name: string };
    setName(user.name);
    const list = await fetch("/lab/pizzaria/pedidos");
    if (!list.ok) {
      setError("Sessão do lab expirou. Volte à trilha e inicie o ambiente de novo.");
      setPending(false);
      return;
    }
    const payload = (await list.json()) as { orders: string[] };
    setOrders(payload.orders);
    setPending(false);
  }

  return (
    <div className="min-h-full bg-[#07080d] px-5 py-10 text-[#f4f1ea]">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Pizzaria do Lab</h1>
        <p className="mt-2 text-sm text-white/60">Contas fictícias. Este app não sai da plataforma.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            E-mail
            <input
              name="email"
              type="email"
              defaultValue="alice@lab.local"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-[#12141c] px-3 py-2.5 outline-none focus-visible:border-[#d6ff4a]"
            />
          </label>
          <label className="block text-sm">
            Senha do lab
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-[#12141c] px-3 py-2.5 outline-none focus-visible:border-[#d6ff4a]"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center rounded-full bg-[#d6ff4a] px-5 text-sm font-semibold text-[#07080d] disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-[#ff5c39]">{error}</p> : null}
        {name ? <p className="mt-4 text-sm">{name} entrou.</p> : null}
        {orders.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {orders.map((item) => (
              <li
                key={item}
                className="list-none rounded-xl border border-white/10 px-3 py-2 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
