import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isAdmin } from "@/lib/access";
import { searchAdminUsers } from "@/lib/admin-users";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Usuários · Admin — ShieldPath", robots: { index: false } };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/entrar");
  if (!isAdmin(actor)) notFound();
  const { q = "" } = await searchParams;
  const users = await searchAdminUsers(q);

  return <div className="relative isolate flex min-h-full flex-col">
    <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
    <SiteHeader />
    <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
      <Link href="/admin" className="text-sm text-muted hover:text-accent">← Operação</Link>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Admin · usuários</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Contas do sistema</h1>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">Consulte progresso, tentativas, papel e lab ativo. Dados de senha, OAuth e respostas livres não aparecem.</p>
      <form className="mt-6 flex max-w-2xl gap-2" action="/admin/usuarios">
        <label className="sr-only" htmlFor="busca-usuario">Buscar por nome ou e-mail</label>
        <input id="busca-usuario" name="q" defaultValue={q} maxLength={120} placeholder="Nome ou e-mail" className="min-h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-4 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent" />
        <button className="min-h-11 rounded-full bg-accent px-5 text-sm font-bold text-ink">Buscar</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-[16px] border border-line">
        <table className="w-full min-w-[760px] text-left text-sm"><caption className="sr-only">Usuários encontrados</caption>
          <thead className="bg-surface/90 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"><tr><th className="px-4 py-3">Conta</th><th className="px-4 py-3">Papel</th><th className="px-4 py-3 text-right">XP</th><th className="px-4 py-3 text-right">Unidades</th><th className="px-4 py-3 text-right">Tentativas</th><th className="px-4 py-3">Lab</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-line hover:bg-white/[0.025]"><td className="px-4 py-3"><Link href={`/admin/usuarios/${user.id}`} className="font-semibold text-text hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{user.name}</Link><span className="mt-1 block text-xs text-muted">{user.email} · {user.provider}</span></td><td className="px-4 py-3">{user.role}</td><td className="px-4 py-3 text-right tabular-nums">{user.xp}</td><td className="px-4 py-3 text-right tabular-nums">{user.completedUnits}</td><td className="px-4 py-3 text-right tabular-nums">{user.attempts}</td><td className={`px-4 py-3 ${user.activeLabId ? "text-defense" : "text-muted"}`}>{user.activeLabId ? "ativo" : "—"}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Mostrando até 100 contas, das mais recentes para as mais antigas.</p>
    </main><SiteFooter />
  </div>;
}
