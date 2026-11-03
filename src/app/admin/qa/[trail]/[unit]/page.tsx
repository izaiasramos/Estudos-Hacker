import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { InlineCode } from "@/components/inline-code";
import { UnitScene } from "@/components/unit-scenes";
import { sceneFor } from "@/content/scenes";
import type { Question } from "@/content/sql-injection";
import { trailBySlug } from "@/content/trails";
import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Preview de unidade · Admin — ShieldPath", robots: { index: false } };

export default async function AdminQaUnitPage({ params }: { params: Promise<{ trail: string; unit: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/entrar");
  if (!isAdmin(actor)) notFound();
  const { trail: slug, unit: unitId } = await params;
  const trail = trailBySlug(slug);
  const unit = trail?.units.find((item) => item.id === unitId);
  if (!trail || !unit) notFound();
  const { default: Body } = await import(`@/content/${trail.slug}/${unit.id}.mdx`);
  const scene = sceneFor(trail.slug, unit.id, { title: unit.title, summary: unit.summary });

  return <div className="relative isolate flex min-h-full flex-col"><div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[420px]" /><SiteHeader />
    <main className="relative mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">
      <nav className="flex flex-wrap gap-3 text-sm"><Link href="/admin/qa" className="text-muted hover:text-accent">← Central de QA</Link><Link href={`/trilha/${trail.slug}`} className="text-info hover:text-text">Ver página normal da trilha</Link></nav>
      <div className="mt-6 rounded-[16px] border border-info/40 bg-info/10 p-4 text-sm text-info"><strong>Preview QA.</strong> Nenhuma ação nesta página altera sua conta. Conteúdo, cena e gabarito são exibidos diretamente, mesmo se a unidade estiver bloqueada ou em rascunho.</div>
      <article className="mt-6 overflow-hidden rounded-[20px] border border-line bg-surface/90 px-5 py-8 sm:px-9"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{trail.title} · unidade {unit.order} · {unit.kind}</p><h1 className="mt-3 text-3xl font-semibold"><InlineCode text={unit.title} /></h1><p className="mt-3 text-muted"><InlineCode text={unit.summary} /></p><div className="mt-8 space-y-5 text-base leading-8 text-text"><Body /></div><UnitScene scene={scene} />
        {unit.questions.length > 0 ? <section className="mt-10 border-t border-line pt-7"><h2 className="text-2xl font-semibold">Prova e gabarito</h2><p className="mt-2 text-sm text-muted">Revisão editorial somente. O envio real do aluno continua protegido pelo fluxo normal.</p><ol className="mt-5 space-y-5">{unit.questions.map((question, index) => <li key={question.id} className="rounded-[16px] border border-line bg-ink/60 p-4"><p className="text-xs font-bold uppercase tracking-wide text-info">Questão {index + 1} · {question.kind}</p><p className="mt-2 font-semibold"><InlineCode text={question.prompt} /></p><AnswerKey question={question} /></li>)}</ol></section> : <p className="mt-8 rounded-xl border border-line p-4 text-sm text-muted">Esta unidade não possui prova cadastrada.</p>}
        {unit.id === "lab-ofensivo" ? <section className="mt-10 rounded-[16px] border border-danger/35 bg-danger/5 p-5"><h2 className="text-xl font-semibold">Simulação embedded da Pizzaria</h2><p className="mt-2 text-sm leading-6 text-muted">Inicia uma sessão operacional em nome do admin e abre o mesmo app fictício usado pelo aluno. Isso não grava progresso, XP, tentativa ou selo.</p><form action="/api/admin/qa/lab/start" method="post" className="mt-4"><button className="min-h-11 rounded-full bg-danger px-5 text-sm font-bold text-ink">Iniciar e abrir simulação</button></form></section> : null}
      </article>
    </main><SiteFooter /></div>;
}

function AnswerKey({ question }: { question: Question }) {
  if (question.kind === "text") return <div className="mt-3 text-sm"><p className="text-defense">Aceita resposta com pelo menos {question.min} caracteres e um destes termos:</p><p className="mt-1 font-mono text-xs text-muted">{question.stems.join(" · ")}</p><p className="mt-2 text-muted">{question.explain}</p></div>;
  if (question.kind === "order") return <div className="mt-3 text-sm"><p className="text-defense">Ordem correta: {question.correctOrder.join(" → ")}</p><p className="mt-2 text-muted">{question.explain}</p></div>;
  return <ul className="mt-3 space-y-2 text-sm">{question.choices.map((choice) => <li key={choice.id} className={choice.correct ? "text-defense" : "text-muted"}><strong>{choice.correct ? "✓" : "○"} {choice.label}</strong><span className="mt-0.5 block text-xs">{choice.explain}</span></li>)}</ul>;
}
