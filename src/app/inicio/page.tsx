import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { readStreak } from "@/lib/streak";
import { squadOf } from "@/lib/squad";
import { hasSeal, hasTrailSeal, listProgress, nextUnit } from "@/lib/trail-progress";

export const metadata: Metadata = {
  title: "Início — ShieldPath",
};

export default async function InicioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const progress = await listProgress(user.id);
  const sqlNext = nextUnit(progress, true, "sql-injection");
  const sessionNext = nextUnit(progress, true, "sessao");
  const authNext = nextUnit(progress, true, "autenticacao");
  const xssNext = nextUnit(progress, true, "xss");
  const csrfNext = nextUnit(progress, true, "csrf");
  const phishingNext = nextUnit(progress, true, "phishing");
  const sqlSeal = hasSeal(progress);
  const sessionSeal = hasTrailSeal(progress, "selo-sessao");
  const authSeal = hasTrailSeal(progress, "selo-autenticacao");
  const xssSeal = hasTrailSeal(progress, "selo-xss");
  const csrfSeal = hasTrailSeal(progress, "selo-csrf");
  const phishingSeal = hasTrailSeal(progress, "selo-phishing");
  const seals =
    Number(sqlSeal) +
    Number(sessionSeal) +
    Number(authSeal) +
    Number(xssSeal) +
    Number(csrfSeal) +
    Number(phishingSeal);
  const level = seals >= 2 ? "Especialista" : seals === 1 ? "Pleno defensivo" : "Jr";
  const { streak } = await readStreak(user.id);
  const squad = await squadOf(user.id);
  const streakLabel =
    streak === 0 ? "Nenhum dia fechado" : streak === 1 ? "1 dia" : `${streak} dias seguidos`;
  const headline = sqlNext
    ? `Continuar — ${sqlNext.title}`
    : sessionNext
      ? `Continuar — ${sessionNext.title}`
      : authNext
        ? `Continuar — ${authNext.title}`
        : xssNext
          ? `Continuar — ${xssNext.title}`
          : csrfNext
            ? `Continuar — ${csrfNext.title}`
            : phishingNext
              ? `Continuar — ${phishingNext.title}`
              : "As trilhas abertas estão fechadas";
  const primary = sqlNext
    ? { href: `/trilha/sql-injection/${sqlNext.id}`, label: "Abrir unidade" }
    : sessionNext
      ? { href: `/trilha/sessao/${sessionNext.id}`, label: "Abrir unidade" }
      : authNext
        ? { href: `/trilha/autenticacao/${authNext.id}`, label: "Abrir unidade" }
        : xssNext
          ? { href: `/trilha/xss/${xssNext.id}`, label: "Abrir unidade" }
          : csrfNext
            ? { href: `/trilha/csrf/${csrfNext.id}`, label: "Abrir unidade" }
            : phishingNext
              ? { href: `/trilha/phishing/${phishingNext.id}`, label: "Abrir unidade" }
              : { href: "/trilha/sql-injection", label: "Ver as trilhas" };

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[720px]" />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        <p className="text-sm text-muted">
          {user.name}
          <span className="mx-2 text-white/20">·</span>
          {user.xp} XP
          <span className="mx-2 text-white/20">·</span>
          {level}
          <span className="mx-2 text-white/20">·</span>
          {streakLabel}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {sqlSeal ? (
            <Link
              href="/trilha/sql-injection/selo"
              className="inline-flex items-center gap-3 rounded-full border border-accent/40 px-4 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-semibold text-ink">
                SQL
              </span>
              Selo · SQL Injection
            </Link>
          ) : null}
          {sessionSeal ? (
            <Link
              href="/trilha/sessao/selo"
              className="inline-flex items-center gap-3 rounded-full border border-defense/40 px-4 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-defense text-[10px] font-semibold text-ink">
                SES
              </span>
              Selo · Sessão
            </Link>
          ) : null}
          {authSeal ? (
            <Link
              href="/trilha/autenticacao/selo"
              className="inline-flex items-center gap-3 rounded-full border border-accent/40 px-4 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-semibold text-ink">
                AUTH
              </span>
              Selo · Autenticação
            </Link>
          ) : null}
          {xssSeal ? (
            <Link
              href="/trilha/xss/selo"
              className="inline-flex items-center gap-3 rounded-full border border-defense/40 px-4 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-defense text-[10px] font-semibold text-ink">
                XSS
              </span>
              Selo · XSS
            </Link>
          ) : null}
          {csrfSeal ? (
            <Link
              href="/trilha/csrf/selo"
              className="inline-flex items-center gap-3 rounded-full border border-accent/40 px-4 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-semibold text-ink">
                CSRF
              </span>
              Selo · CSRF
            </Link>
          ) : null}
          {phishingSeal ? (
            <Link
              href="/trilha/phishing/selo"
              className="inline-flex items-center gap-3 rounded-full border border-defense/40 px-4 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-defense text-[10px] font-semibold text-ink">
                PHI
              </span>
              Selo · Phishing
            </Link>
          ) : null}
        </div>
        <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight">{headline}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Seis trilhas no ar, a mesma regra: a unidade abre quando a anterior fecha, e o selo sai
          depois da defesa.
        </p>
        <Link
          href={primary.href}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          {primary.label}
        </Link>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/trilha/sql-injection"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Trilha</p>
            <h2 className="mt-2 text-xl font-semibold">SQL Injection</h2>
            <p className="mt-2 text-sm text-muted">
              {sqlSeal ? "Selo fechado." : sqlNext ? `Próxima: ${sqlNext.title}` : "Aberta."}
            </p>
          </Link>
          <Link
            href="/trilha/sessao"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Trilha</p>
            <h2 className="mt-2 text-xl font-semibold">Sessão</h2>
            <p className="mt-2 text-sm text-muted">
              {sessionSeal
                ? "Selo fechado."
                : sessionNext
                  ? `Próxima: ${sessionNext.title}`
                  : "Aberta."}
            </p>
          </Link>
          <Link
            href="/trilha/autenticacao"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Trilha</p>
            <h2 className="mt-2 text-xl font-semibold">Autenticação</h2>
            <p className="mt-2 text-sm text-muted">
              {authSeal
                ? "Selo fechado."
                : authNext
                  ? `Próxima: ${authNext.title}`
                  : "Aberta."}
            </p>
          </Link>
          <Link
            href="/trilha/xss"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Trilha</p>
            <h2 className="mt-2 text-xl font-semibold">XSS</h2>
            <p className="mt-2 text-sm text-muted">
              {xssSeal ? "Selo fechado." : xssNext ? `Próxima: ${xssNext.title}` : "Aberta."}
            </p>
          </Link>
          <Link
            href="/trilha/csrf"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Trilha</p>
            <h2 className="mt-2 text-xl font-semibold">CSRF</h2>
            <p className="mt-2 text-sm text-muted">
              {csrfSeal ? "Selo fechado." : csrfNext ? `Próxima: ${csrfNext.title}` : "Aberta."}
            </p>
          </Link>
          <Link
            href="/trilha/phishing"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Trilha</p>
            <h2 className="mt-2 text-xl font-semibold">Phishing</h2>
            <p className="mt-2 text-sm text-muted">
              {phishingSeal
                ? "Selo fechado."
                : phishingNext
                  ? `Próxima: ${phishingNext.title}`
                  : "Aberta."}
            </p>
          </Link>
          <Link
            href="/squad"
            className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:col-span-2 lg:col-span-1"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Time</p>
            <h2 className="mt-2 text-xl font-semibold">{squad ? squad.name : "Montar o time"}</h2>
            <p className="mt-2 text-sm text-muted">
              {squad ? "Nota, tentativas e ranking do time." : "Abra um time ou entre com o código."}
            </p>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
