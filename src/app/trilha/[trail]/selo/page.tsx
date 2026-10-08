import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { trailAfter, trailBySlug, type Trail } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { hasTrailSeal, listProgress, sealDate } from "@/lib/trail-progress";

type Params = Promise<{ trail: string }>;

const DATE = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" });

// Classes literais para o Tailwind enxergar no build.
const TONE: Record<Trail["seal"]["tone"], { ring: string; core: string }> = {
  accent: { ring: "border-accent/60", core: "bg-accent" },
  defense: { ring: "border-defense/60", core: "bg-defense" },
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { trail: slug } = await params;
  const trail = trailBySlug(slug);
  return {
    title: trail && trail.status !== "rascunho" ? `Selo de ${trail.seal.name} — ShieldPath` : "Selo — ShieldPath",
  };
}

export default async function SealPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const { trail: slug } = await params;
  const trail = trailBySlug(slug);
  if (!trail || !canSeeTrail(user, trail)) notFound();

  const progress = await listProgress(user.id);
  if (!hasTrailSeal(progress, trail.sealId)) redirect(`/trilha/${trail.slug}`);

  const tone = TONE[trail.seal.tone];
  const earnedAt = sealDate(progress, trail.sealId);
  const after = trailAfter(trail.slug);

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Especialidade</p>
        <div className="relative mt-8 grid size-28 place-items-center">
          <span className={`seal-ring absolute inset-0 rounded-full border ${tone.ring}`} />
          <span
            className={`seal-core grid size-16 place-items-center rounded-full text-lg font-semibold text-ink ${tone.core}`}
          >
            {trail.seal.badge}
          </span>
        </div>
        <h1 className="seal-name mt-8 text-3xl font-semibold tracking-tight">{trail.seal.name}</h1>
        {earnedAt ? (
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-muted">
            Emitido em <time dateTime={earnedAt}>{DATE.format(new Date(earnedAt))}</time>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-muted">{trail.seal.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/inicio"
            className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Voltar ao início
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
      </main>
      <SiteFooter />
    </div>
  );
}
