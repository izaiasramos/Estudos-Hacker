import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TRAILS } from "@/content/trails";
import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Central de QA · Admin — DefendaDev", robots: { index: false } };

export default async function AdminQaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!isAdmin(user)) notFound();

  return <div className="relative isolate flex min-h-full flex-col">
    <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
    <SiteHeader />
    <main className="relative mx-auto w-full max-w-[90rem] flex-1 px-5 py-8 sm:px-8">
      <Link href="/admin" className="text-sm text-muted hover:text-accent">← Operação</Link>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-info">Admin · QA isolado</p>
      <h1 className="mt-3 text-4xl font-semibold">Revisar o curso sem progredir</h1>
      <div className="mt-4 rounded-[16px] border border-info/35 bg-info/10 p-4 text-sm leading-6 text-info"><strong>Modo seguro de revisão.</strong> Estas páginas não gravam XP, progresso, tentativas, streak, competição ou selo. As provas exibem o gabarito para revisão editorial.</div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {TRAILS.map((trail) => <section key={trail.slug} className="rounded-[18px] border border-line bg-surface/75 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{trail.title}</h2><span className={`rounded-full px-2 py-1 text-[10px] uppercase ${trail.status === "rascunho" ? "bg-danger/10 text-danger" : "bg-defense/10 text-defense"}`}>{trail.status ?? "publicada"}</span></div>
          <p className="mt-2 text-sm text-muted">{trail.summary}</p>
          <ol className="mt-4 space-y-2">{trail.units.map((unit) => <li key={unit.id}><Link href={`/admin/qa/${trail.slug}/${unit.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-ink/50 px-3 text-sm hover:border-info/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info"><span><span className="mr-2 font-mono text-xs text-info">{unit.order}</span>{unit.title}</span><span className="shrink-0 text-xs text-muted">{unit.kind} →</span></Link></li>)}</ol>
        </section>)}
      </div>
    </main>
    <SiteFooter />
  </div>;
}
