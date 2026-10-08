import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TRAILS, type Trail } from "@/content/trails";
import { getCurrentUser } from "@/lib/current-user";
import { readStreak } from "@/lib/streak";
import { squadOf } from "@/lib/squad";
import { accountLevel, hasTrailSeal, listProgress, nextUnit } from "@/lib/trail-progress";

export const metadata: Metadata = {
  title: "Início — ShieldPath",
};

// Classes literais para o Tailwind enxergar no build.
const TONE: Record<Trail["seal"]["tone"], { chip: string; dot: string; label: string }> = {
  accent: { chip: "border-accent/40", dot: "bg-accent", label: "text-accent" },
  defense: { chip: "border-defense/40", dot: "bg-defense", label: "text-defense" },
};

export default async function InicioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const progress = await listProgress(user.id);
  const trails = TRAILS.map((trail) => ({
    trail,
    sealed: hasTrailSeal(progress, trail.sealId),
    upcoming: nextUnit(progress, true, trail.slug),
  }));
  const seals = trails.filter((item) => item.sealed).length;
  const level = accountLevel(seals);
  const { streak } = await readStreak(user.id);
  const squad = await squadOf(user.id);
  const streakLabel =
    streak === 0 ? "Nenhum dia fechado" : streak === 1 ? "1 dia" : `${streak} dias seguidos`;

  // O CTA principal segue a ordem da spec: a primeira trilha com unidade aberta.
  const current = trails.find((item) => item.upcoming);
  const headline = current?.upcoming
    ? `Continuar — ${current.upcoming.title}`
    : "As trilhas abertas estão fechadas";
  const primary = current?.upcoming
    ? { href: `/trilha/${current.trail.slug}/${current.upcoming.id}`, label: "Abrir unidade" }
    : { href: `/trilha/${TRAILS[0].slug}`, label: "Ver as trilhas" };

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
          {trails
            .filter((item) => item.sealed)
            .map(({ trail }) => (
              <Link
                key={trail.slug}
                href={`/trilha/${trail.slug}/selo`}
                className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${TONE[trail.seal.tone].chip}`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full text-[10px] font-semibold text-ink ${TONE[trail.seal.tone].dot}`}
                >
                  {trail.seal.badge}
                </span>
                Selo · {trail.seal.name}
              </Link>
            ))}
        </div>
        <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight">{headline}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {TRAILS.length} trilhas no ar, a mesma regra: a unidade abre quando a anterior fecha, e o
          selo sai depois da defesa.
        </p>
        <Link
          href={primary.href}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          {primary.label}
        </Link>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trails.map(({ trail, sealed, upcoming }) => (
            <Link
              key={trail.slug}
              href={`/trilha/${trail.slug}`}
              className="rounded-[16px] border border-white/10 bg-surface/80 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.16em] ${TONE[trail.seal.tone].label}`}
              >
                Trilha
              </p>
              <h2 className="mt-2 text-xl font-semibold">{trail.title}</h2>
              <p className="mt-2 text-sm text-muted">
                {sealed ? "Selo fechado." : upcoming ? `Próxima: ${upcoming.title}` : "Aberta."}
              </p>
            </Link>
          ))}
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
