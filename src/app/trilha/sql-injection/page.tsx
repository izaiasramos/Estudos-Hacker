import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UnitRail } from "@/components/unit-rail";
import { TRAIL } from "@/content/sql-injection";
import { getCurrentUser } from "@/lib/current-user";
import { hasSeal, listProgress, nextUnit } from "@/lib/trail-progress";

export const metadata: Metadata = {
  title: "SQL Injection — ShieldPath",
};

export default async function TrailPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const progress = await listProgress(user.id);
  const upcoming = nextUnit(progress, true);
  const seal = hasSeal(progress);

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto grid w-full max-w-6xl flex-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:overflow-visible">
            <UnitRail progress={progress} ethicsDone />
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Trilha</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{TRAIL.title}</h1>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">{TRAIL.summary}</p>
          {upcoming ? (
            <Link
              href={`/trilha/sql-injection/${upcoming.id}`}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Continuar — {upcoming.title}
            </Link>
          ) : seal ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/trilha/sql-injection/selo"
                className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink"
              >
                Ver o selo
              </Link>
              <Link
                href="/trilha/sessao"
                className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm text-text"
              >
                Abrir a trilha de sessão
              </Link>
            </div>
          ) : (
            <p className="mt-8 max-w-[68ch] text-sm leading-relaxed text-muted">
              O selo espera o laboratório em que a defesa passa nos testes.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
