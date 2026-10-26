import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UnitRail } from "@/components/unit-rail";
import { trailAfter, trailBySlug } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { getLearningPath, LEARNING_LEVEL_LABELS, type LearningLevel } from "@/lib/learning-path";
import { hasTrailSeal, listProgress, nextUnit } from "@/lib/trail-progress";

type Params = Promise<{ trail: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { trail: slug } = await params;
  const trail = trailBySlug(slug);
  return { title: `${trail && trail.status !== "rascunho" ? trail.title : "Trilha"} — ShieldPath` };
}

export default async function TrailPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const { trail: slug } = await params;
  const trail = trailBySlug(slug);
  if (!trail || !canSeeTrail(user, trail)) notFound();

  const basePath = `/trilha/${trail.slug}`;
  const progress = await listProgress(user.id);
  const learningPath = await getLearningPath(user.id, trail.slug);
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
          <LearningPathChoice trailSlug={trail.slug} selected={learningPath?.level ?? null} />
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

function LearningPathChoice({ trailSlug, selected }: { trailSlug: string; selected: LearningLevel | null }) {
  const levels = Object.entries(LEARNING_LEVEL_LABELS) as [LearningLevel, (typeof LEARNING_LEVEL_LABELS)[LearningLevel]][];
  return (
    <section className="mt-8" aria-labelledby="jornada-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Sua jornada</p>
          <h2 id="jornada-title" className="mt-2 text-xl font-semibold">
            {selected ? LEARNING_LEVEL_LABELS[selected].name : "Como você quer percorrer esta trilha?"}
          </h2>
          {selected ? <p className="mt-2 text-sm text-muted">{LEARNING_LEVEL_LABELS[selected].guidance}</p> : null}
        </div>
      </div>
      <div className={`mt-4 grid gap-3 ${selected ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
        {levels.map(([level, details]) => (
          <form key={level} action="/api/trilha/jornada" method="post" className={`rounded-[16px] border p-4 ${selected === level ? "border-accent/60 bg-accent/10" : "border-white/10 bg-surface/80"}`}>
            <input type="hidden" name="trail" value={trailSlug} />
            <input type="hidden" name="level" value={level} />
            <h3 className="font-semibold">{details.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{details.guidance}</p>
            <button type="submit" className="mt-4 inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {selected === level ? "Jornada atual" : selected ? `Trocar para ${details.name}` : details.action}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
