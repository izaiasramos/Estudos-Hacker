import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { labSlots } from "@/components/unit-lab";
import { UnitRail } from "@/components/unit-rail";
import type { CalloutTone, Unit } from "@/content/sql-injection";
import { trailBySlug } from "@/content/trails";
import { getCurrentUser } from "@/lib/current-user";
import {
  hasTrailSeal,
  listProgress,
  nextUnit,
  shuffleChoices,
  unitStatus,
} from "@/lib/trail-progress";

const CALLOUT: Record<CalloutTone, string> = {
  conceito: "Conceito",
  analogia: "Analogia",
  armadilha: "Armadilha comum",
  dev: "Como um dev vê isso",
};

type Params = Promise<{ trail: string; unit: string }>;

function locate(slug: string, unitId: string) {
  const trail = trailBySlug(slug);
  const unit = trail?.units.find((item) => item.id === unitId) ?? null;
  return { trail, unit };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { trail: slug, unit: unitId } = await params;
  const { trail, unit } = locate(slug, unitId);
  return { title: `${unit?.title ?? trail?.title ?? "Trilha"} — ShieldPath` };
}

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ ok?: string; resp?: string; falta?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const { trail: slug, unit: unitId } = await params;
  const { trail, unit } = locate(slug, unitId);
  if (!trail || !unit) notFound();

  const basePath = `/trilha/${trail.slug}`;
  const progress = await listProgress(user.id);
  const status = unitStatus(unit, progress, true);
  if (status === "bloqueada") redirect(basePath);

  const query = await searchParams;
  const done = status === "concluída";
  const wrong = readResponses(query.resp);
  const passedNow = query.ok !== undefined && done;
  const following = nextUnit(progress, true, trail.slug);
  const lab = labSlots(unit.id, {
    userId: user.id,
    done,
    missing: (query.falta ?? "").split(",").filter(Boolean),
  });

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <SiteHeader />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 sm:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          <UnitRail currentId={unit.id} progress={progress} ethicsDone units={trail.units} basePath={basePath} />
        </div>
        <div className="grid flex-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="sticky top-6 hidden self-start lg:block">
            <UnitRail currentId={unit.id} progress={progress} ethicsDone units={trail.units} basePath={basePath} />
          </aside>
          <article
            className={`mx-auto w-full rounded-[16px] border border-white/10 bg-surface/80 px-5 py-8 sm:px-8 ${
              lab.wide ? "max-w-3xl" : "max-w-[68ch]"
            }`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Unidade {unit.order} · {status}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{unit.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">{unit.summary}</p>
            {lab.before}
            <Blocks unit={unit} />
            {lab.afterBlocks}
            <Quiz
              unit={unit}
              wrong={wrong}
              passedNow={passedNow}
              score={query.ok}
              sealPending={unit.kind === "checkpoint" && !hasTrailSeal(progress, trail.sealId)}
              followingHref={following ? `${basePath}/${following.id}` : basePath}
              followingLabel={following?.title ?? null}
              attempts={progress.get(unit.id)?.attempts ?? 0}
              done={done}
            />
            {unit.kind !== "lab" && !done ? (
              <ReadBar unitId={unit.id} hasQuiz={unit.questions.length > 0} />
            ) : null}
            {lab.end}
          </article>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Blocks({ unit }: { unit: Unit }) {
  return (
    <div className="mt-8 space-y-4 text-[15px] leading-7 text-text/90">
      {unit.blocks.map((block, index) => {
        if (block.type === "p") return <p key={index}>{block.text}</p>;
        if (block.type === "code") {
          return (
            <figure key={index}>
              <figcaption className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {block.caption}
              </figcaption>
              <pre className="overflow-x-auto rounded-[16px] border border-white/10 bg-ink p-4 font-mono text-[13px] leading-6 text-text">
                <code>{block.code}</code>
              </pre>
            </figure>
          );
        }
        if (block.type === "glossary") {
          return (
            <p key={index}>
              <span className="glossary">
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {block.term}
                </button>
                <span className="glossary-panel" role="tooltip">
                  {block.text}
                </span>
              </span>
            </p>
          );
        }
        return (
          <aside key={index} className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              {CALLOUT[block.tone]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{block.text}</p>
          </aside>
        );
      })}
    </div>
  );
}

function quizHeading(unit: Unit) {
  if (unit.kind === "exercise") return "Exercício";
  if (unit.kind === "checkpoint") return "Checkpoint";
  if (unit.kind === "lab") return "O achado";
  return "Quiz";
}

function Quiz({
  unit,
  wrong,
  passedNow,
  score,
  sealPending,
  followingHref,
  followingLabel,
  attempts,
  done,
}: {
  unit: Unit;
  wrong: Map<string, string>;
  passedNow: boolean;
  score?: string;
  sealPending: boolean;
  followingHref: string;
  followingLabel: string | null;
  attempts: number;
  done: boolean;
}) {
  if (unit.questions.length === 0) return null;
  return (
    <section id="quiz" className="mt-10 scroll-mt-24 border-t border-white/10 pt-8">
      <h2 className="text-lg font-semibold tracking-tight">{quizHeading(unit)}</h2>
      {passedNow ? (
        <p className="mt-3 text-sm leading-relaxed text-defense" role="status">
          {score}% — esta unidade ficou para trás.
          {sealPending ? " O selo continua esperando o laboratório defensivo." : ""}
        </p>
      ) : null}
      {wrong.size > 0 ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          Ainda não chegou a 70%. O motivo de cada resposta está embaixo dela.
        </p>
      ) : null}
      {done ? (
        <p className="mt-4 text-sm text-muted">Você já concluiu esta unidade. Pode reler à vontade.</p>
      ) : (
        <form action="/api/trilha/quiz" method="post" className="mt-6 space-y-8">
          <input type="hidden" name="unit" value={unit.id} />
          {unit.questions.map((question) => {
            const picked = wrong.get(question.id);
            if (question.kind === "text") {
              return (
                <div key={question.id}>
                  <label htmlFor={question.id} className="text-sm font-medium">
                    {question.prompt}
                  </label>
                  <textarea
                    id={question.id}
                    name={question.id}
                    required
                    minLength={question.min}
                    rows={4}
                    className="mt-3 w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                  />
                  {picked !== undefined ? (
                    <p className="mt-2 text-sm leading-relaxed text-danger">{question.explain}</p>
                  ) : null}
                </div>
              );
            }
            const choices = shuffleChoices(question.choices, attempts + 1);
            return (
              <fieldset key={question.id} className="space-y-3">
                <legend className="text-sm font-medium">{question.prompt}</legend>
                {choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-ink/40 px-4 py-3 text-sm"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={choice.id}
                      required
                      className="mt-1 accent-[#d6ff4a]"
                    />
                    <span>{choice.label}</span>
                  </label>
                ))}
                {picked !== undefined ? (
                  <p className="text-sm leading-relaxed text-danger">
                    {question.choices.find((choice) => choice.id === picked)?.explain ??
                      question.choices.find((choice) => !choice.correct)?.explain}
                  </p>
                ) : null}
              </fieldset>
            );
          })}
          <button
            type="submit"
            className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Enviar respostas
          </button>
        </form>
      )}
      {passedNow ? (
        <Link
          href={followingHref}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink"
        >
          {followingLabel ? `Seguir — ${followingLabel}` : "Ver a trilha"}
        </Link>
      ) : null}
    </section>
  );
}

/** Barra persistente da seção 15.7: “Marcar como lida” / “Ir ao quiz”, sempre alcançável. */
function ReadBar({ unitId, hasQuiz }: { unitId: string; hasQuiz: boolean }) {
  return (
    <form
      action="/api/trilha/ler"
      method="post"
      className="sticky bottom-4 mt-8 flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-ink/90 px-3 py-2 backdrop-blur"
    >
      <input type="hidden" name="unit" value={unitId} />
      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-full px-4 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Marcar como lida
      </button>
      {hasQuiz ? (
        <a
          href="#quiz"
          className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Ir ao quiz
        </a>
      ) : null}
    </form>
  );
}

function readResponses(raw: string | undefined) {
  const map = new Map<string, string>();
  if (!raw) return map;
  for (const part of raw.split(",")) {
    const splitAt = part.indexOf("~");
    if (splitAt < 0) continue;
    map.set(part.slice(0, splitAt), decodeURIComponent(part.slice(splitAt + 1)));
  }
  return map;
}
