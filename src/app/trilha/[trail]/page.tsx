import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UnitRail } from "@/components/unit-rail";
import { trailAfter, trailBySlug } from "@/content/trails";
import { getCurrentUser } from "@/lib/current-user";
import { hasTrailSeal, listProgress, nextUnit } from "@/lib/trail-progress";

type Params = Promise<{ trail: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { trail: slug } = await params;
  return { title: `${trailBySlug(slug)?.title ?? "Trilha"} — ShieldPath` };
}

export default async function TrailPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const { trail: slug } = await params;
  const trail = trailBySlug(slug);
  if (!trail) notFound();

  const basePath = `/trilha/${trail.slug}`;
  const progress = await listProgress(user.id);
  const upcoming = nextUnit(progress, true, trail.slug);
  const seal = hasTrailSeal(progress, trail.sealId);
  const after = trailAfter(trail.slug);

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto grid w-full max-w-6xl flex-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:overflow-visible">
            <UnitRail progress={progress} ethicsDone units={trail.units} basePath={basePath} />
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Trilha</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{trail.title}</h1>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">{trail.summary}</p>
          {upcoming ? (
            <Link
              href={`${basePath}/${upcoming.id}`}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Continuar — {upcoming.title}
            </Link>
          ) : seal ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${basePath}/selo`}
                className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Ver o selo
              </Link>
              {after ? (
                <Link
                  href={`/trilha/${after.slug}`}
                  className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Próxima trilha — {after.title}
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-8 max-w-[68ch] text-sm leading-relaxed text-muted">{trail.sealPending}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
