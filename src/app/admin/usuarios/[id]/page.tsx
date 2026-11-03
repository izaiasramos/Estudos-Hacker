import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isAdmin } from "@/lib/access";
import { getAdminUser } from "@/lib/admin-users";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Detalhe do usuário · Admin — ShieldPath", robots: { index: false } };
const DATE = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function AdminUserDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/entrar");
  if (!isAdmin(actor)) notFound();
  const { id } = await params;
  const detail = await getAdminUser(id);
  if (!detail) notFound();
  const query = await searchParams;
  const message = query.ok === "papel" ? "Papel atualizado." : query.ok === "lab" ? "Lab encerrado." : query.erro === "proprio" ? "Você não pode alterar o próprio papel." : query.erro === "ultimo-admin" ? "O último administrador não pode ser rebaixado." : query.erro === "lab" ? "O lab já não estava ativo." : query.erro ? "A alteração não pôde ser aplicada." : null;
  const user = detail.user;

  return <div className="relative isolate flex min-h-full flex-col"><div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[420px]" /><SiteHeader />
    <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
      <Link href="/admin/usuarios" className="text-sm text-muted hover:text-accent">← Usuários</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Conta</p><h1 className="mt-2 text-3xl font-semibold">{user.name}</h1><p className="mt-2 text-sm text-muted">{user.email} · {user.provider}</p></div><dl className="grid grid-cols-3 gap-3"><Mini label="XP" value={user.xp} /><Mini label="Concluídas" value={user.completedUnits} /><Mini label="Tentativas" value={user.attempts} /></dl></div>
      {message ? <p role={query.erro ? "alert" : "status"} className={`mt-5 text-sm ${query.erro ? "text-danger" : "text-defense"}`}>{message}</p> : null}
      <section className="mt-8 rounded-[18px] border border-line bg-surface/75 p-5"><h2 className="text-lg font-semibold">Controle administrativo</h2><p className="mt-2 text-sm text-muted">Criada em {DATE.format(new Date(user.createdAt))} · ética {user.ethicsAcceptedAt ? "aceita" : "pendente"} · lab {user.activeLabId ? "ativo" : "inativo"}</p>
        <form action={`/api/admin/users/${user.id}/role`} method="post" className="mt-4 flex flex-wrap items-end gap-3"><label className="grid gap-1 text-xs font-semibold text-muted">Papel<select name="role" defaultValue={user.role} className="min-h-11 rounded-xl border border-line-strong bg-ink px-3 text-sm text-text"><option value="learner">learner</option><option value="admin">admin</option></select></label><button type="submit" className="min-h-11 rounded-full border border-accent px-4 text-sm font-bold text-accent disabled:opacity-50" disabled={actor.id === user.id}>Salvar papel</button>{actor.id === user.id ? <span className="text-xs text-muted">Seu próprio papel é protegido.</span> : null}</form>
        {user.activeLabId ? <form action="/api/admin/lab/stop" method="post" className="mt-4"><input type="hidden" name="session" value={user.activeLabId} /><input type="hidden" name="returnTo" value={`/admin/usuarios/${user.id}`} /><button className="min-h-11 rounded-full border border-danger px-4 text-sm font-bold text-danger">Encerrar lab ativo</button></form> : null}
      </section>
      <section className="mt-10"><h2 className="text-xl font-semibold">Progresso</h2><div className="mt-3 overflow-x-auto rounded-[16px] border border-line"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-surface/90 text-xs text-muted"><tr><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Nota</th><th className="px-4 py-3 text-right">Tentativas</th><th className="px-4 py-3">Conclusão</th></tr></thead><tbody>{detail.progress.map((row) => <tr key={row.unit_id} className="border-t border-line"><td className="px-4 py-3 font-mono text-xs">{row.unit_id}</td><td className="px-4 py-3">{row.status}</td><td className="px-4 py-3 text-right">{row.score ?? "—"}</td><td className="px-4 py-3 text-right">{row.attempts}</td><td className="px-4 py-3 text-muted">{row.completed_at ? DATE.format(new Date(row.completed_at)) : "—"}</td></tr>)}</tbody></table></div></section>
      <section className="mt-10"><h2 className="text-xl font-semibold">Últimas provas e atividades</h2>{detail.attempts.length ? <ul className="mt-3 grid gap-2">{detail.attempts.map((attempt, index) => <li key={`${attempt.unit_id}-${attempt.submitted_at}-${index}`} className="flex flex-wrap justify-between gap-3 rounded-xl border border-line bg-surface/60 p-3 text-sm"><span><strong>{attempt.unit_id}</strong> · {attempt.mode}</span><span className={attempt.passed ? "text-defense" : "text-danger"}>{attempt.score}% · {attempt.passed ? "aprovada" : "reprovada"} · {DATE.format(new Date(attempt.submitted_at))}</span></li>)}</ul> : <p className="mt-3 text-sm text-muted">Nenhuma tentativa registrada.</p>}</section>
    </main><SiteFooter /></div>;
}

function Mini({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-line bg-surface/80 p-3 text-center"><dt className="text-[10px] uppercase text-muted">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>; }
