import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UnitRail } from "@/components/unit-rail";
import { TRAIL, UNITS } from "@/content/csrf";
import { getCurrentUser } from "@/lib/current-user";
import { hasTrailSeal, listProgress, nextUnit } from "@/lib/trail-progress";

export const metadata: Metadata = {
  title: "CSRF — ShieldPath",
};

export default async function CsrfTrailPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const progress = await listProgress(user.id);
  const upcoming = nextUnit(progress, true, "csrf");
  const seal = hasTrailSeal(progress, "selo-csrf");

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto grid w-full max-w-6xl flex-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:overflow-visible">
            <UnitRail progress={progress} ethicsDone units={UNITS} basePath="/trilha/csrf" />
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Trilha</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{TRAIL.title}</h1>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">{TRAIL.summary}</p>
          {upcoming ? (
            <Link
              href={`/trilha/csrf/${upcoming.id}`}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Continuar — {upcoming.title}
            </Link>
          ) : seal ? (
            <Link
              href="/trilha/csrf/selo"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink"
            >
              Ver o selo
            </Link>
          ) : (
            <p className="mt-8 max-w-[68ch] text-sm leading-relaxed text-muted">
              O selo espera o lab de transferência no checker e o checkpoint.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
