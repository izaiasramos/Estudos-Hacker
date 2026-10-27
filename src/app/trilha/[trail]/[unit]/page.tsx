import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AudioOutcome } from "@/components/audio-outcome";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { InlineCode } from "@/components/inline-code";
import { OrderActivity } from "@/components/learning-activity";
import { labSlots } from "@/components/unit-lab";
import { UnitRail } from "@/components/unit-rail";
import { UnitScene } from "@/components/unit-scenes";
import { sceneFor } from "@/content/scenes";
import type { Unit } from "@/content/sql-injection";
import { trailBySlug } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { getLearningPath, LEARNING_LEVEL_LABELS } from "@/lib/learning-path";
import {
  hasTrailSeal,
  listProgress,
  nextUnit,
  shuffleChoices,
  unitStatus,
} from "@/lib/trail-progress";

type Params = Promise<{ trail: string; unit: string }>;

function locate(slug: string, unitId: string) {
  const trail = trailBySlug(slug);
  const unit = trail?.units.find((item) => item.id === unitId) ?? null;
  return { trail, unit };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { trail: slug, unit: unitId } = await params;
  const { trail, unit } = locate(slug, unitId);
  if (!trail || trail.status === "rascunho") return { title: "Trilha — ShieldPath" };
  return { title: `${unit?.title ?? trail.title} — ShieldPath` };
}

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ ok?: string; resp?: string; falta?: string; practice?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const { trail: slug, unit: unitId } = await params;
  const { trail, unit } = locate(slug, unitId);
  if (!trail || !unit || !canSeeTrail(user, trail)) notFound();

  const basePath = `/trilha/${trail.slug}`;
  const progress = await listProgress(user.id);
  const learningPath = await getLearningPath(user.id, trail.slug);
  const status = unitStatus(unit, progress, true);
  if (status === "bloqueada") redirect(basePath);

  const query = await searchParams;
  const done = status === "concluída";
  const wrong = readResponses(query.resp);
  const passedNow = query.ok !== undefined && done;
  const attempts = progress.get(unit.id)?.attempts ?? 0;
  const following = nextUnit(progress, true, trail.slug);
  const lab = labSlots(unit.id, {
    userId: user.id,
    done,
    missing: (query.falta ?? "").split(",").filter(Boolean),
  });

  return (
    <div className="relative isolate flex min-h-full max-w-full flex-col overflow-x-clip">
      {passedNow ? <AudioOutcome outcome="success" id={`quiz:${trail.slug}:${unit.id}:${attempts}:success:${query.ok}`} /> : null}
      {wrong.size > 0 ? <AudioOutcome outcome="error" id={`quiz:${trail.slug}:${unit.id}:${attempts}:error:${query.resp}`} /> : null}
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <SiteHeader />
      <div className="relative mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8">
        <div className="mb-6 w-full min-w-0 max-w-full lg:hidden">
          <UnitRail currentId={unit.id} progress={progress} ethicsDone units={trail.units} basePath={basePath} />
        </div>
        <div className="grid min-w-0 flex-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="sticky top-6 hidden self-start lg:block">
            <UnitRail currentId={unit.id} progress={progress} ethicsDone units={trail.units} basePath={basePath} />
          </aside>
          <article
            className={`mx-auto min-w-0 w-full overflow-hidden rounded-[20px] border border-line bg-surface/90 px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.2)] sm:px-9 sm:py-10 ${
              lab.wide ? "max-w-3xl" : "max-w-[68ch]"
            }`}
          >
            <p className="text-sm font-semibold text-accent">
              Unidade {unit.order} · {status}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"><InlineCode text={unit.title} /></h1>
            <p className="mt-4 text-base leading-7 text-muted"><InlineCode text={unit.summary} /></p>
            {learningPath ? (
              <div className="mt-5 rounded-[16px] border border-white/10 bg-ink/40 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Jornada {LEARNING_LEVEL_LABELS[learningPath.level].name}</p>
                <p className="mt-2 text-sm text-muted">{LEARNING_LEVEL_LABELS[learningPath.level].guidance}</p>
                {learningPath.level === "advanced" && (unit.questions.length > 0 || unit.kind === "lab") ? (
                  <a href={unit.kind === "lab" ? "#lab" : "#quiz"} className="mt-3 inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    Ir direto à prática
                  </a>
                ) : null}
              </div>
            ) : null}
            <span id="lab" className="scroll-mt-24" />
            {lab.before}
            <Blocks slug={trail.slug} unitId={unit.id} title={unit.title} summary={unit.summary} />
            {lab.afterBlocks}
            {/* Fica entre o texto e o quiz: fixa durante a leitura, para de flutuar quando o quiz chega. */}
            {unit.kind !== "lab" && !done ? (
              <ReadBar unitId={unit.id} hasQuiz={unit.questions.length > 0} />
            ) : null}
            <Quiz
              unit={unit}
              wrong={wrong}
              passedNow={passedNow}
              score={query.ok}
              sealPending={unit.kind === "checkpoint" && !hasTrailSeal(progress, trail.sealId)}
              followingHref={following ? `${basePath}/${following.id}` : basePath}
              followingLabel={following?.title ?? null}
              attempts={attempts}
              done={done}
              practice={done && query.practice === "1"}
            />
            {lab.end}
          </article>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

/**
 * Texto da unidade em MDX. O caminho sai de `TRAILS` (slug e id já validados), nunca do pedido.
 * Uma unidade sem arquivo é erro de conteúdo: o teste `content-mdx.test.ts` pega antes do deploy.
 */
async function Blocks({
  slug,
  unitId,
  title,
  summary,
}: {
  slug: string;
  unitId: string;
  title: string;
  summary: string;
}) {
  const { default: Body } = await import(`@/content/${slug}/${unitId}.mdx`);
  const scene = sceneFor(slug, unitId, { title, summary });

  return (
    <>
      <div className="mt-8 space-y-5 text-base leading-8 text-text">
        <Body />
      </div>
      <UnitScene scene={scene} />
    </>
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
  practice,
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
  practice: boolean;
}) {
  if (unit.questions.length === 0) return null;
  return (
    <section
      id="quiz"
      className={`quiz-shell mt-12 scroll-mt-24 rounded-[24px] border border-line-strong bg-ink/55 p-5 sm:p-7 ${
        passedNow ? "quiz-settle" : wrong.size > 0 ? "border-danger/50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-11 place-items-center rounded-2xl bg-accent/10 text-xl text-accent">⌁</span>
        <div>
          <p className="text-sm font-semibold text-accent">Central de treinamento</p>
          <h2 className="mt-0.5 text-2xl font-semibold tracking-tight">{quizHeading(unit)}</h2>
        </div>
      </div>
      {!passedNow && wrong.size === 0 && !done ? <p className="mt-4 text-base leading-7 text-muted">Complete as atividades para confirmar o que aprendeu. Você pode revisar e tentar novamente.</p> : null}
      {passedNow ? (
        <p className="mt-3 text-sm leading-relaxed text-defense" role="status">
          {practice ? `${score}% — prática concluída. Seu XP, status e nota oficial não mudaram.` : `${score}% — esta unidade ficou para trás.`}
          {!practice && sealPending ? " O selo continua esperando o laboratório defensivo." : ""}
        </p>
      ) : null}
      {wrong.size > 0 ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {practice
            ? "Esta prática ficou abaixo de 70%. Seu XP, status e nota oficial não mudaram; revise o feedback e tente novamente."
            : "Ainda não chegou a 70%. O motivo de cada resposta está embaixo dela."}
        </p>
      ) : null}
      {done && !practice ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">Você já concluiu esta unidade. A prática não altera sua nota oficial nem o XP.</p>
          <Link href="?practice=1#quiz" className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Praticar novamente
          </Link>
        </div>
      ) : (
        <form action="/api/trilha/quiz" method="post" className="mt-6 space-y-8">
          <input type="hidden" name="unit" value={unit.id} />
          {practice ? <input type="hidden" name="practice" value="1" /> : null}
          {unit.questions.map((question, questionIndex) => {
            const picked = wrong.get(question.id);
            if (question.kind === "order") {
              return (
                <div key={question.id} className="quiz-question rise" style={{ animationDelay: `${questionIndex * 70}ms` }}>
                  <p className="mb-3 text-sm font-semibold text-info">Atividade {questionIndex + 1} de {unit.questions.length} · Organizar</p>
                  <OrderActivity question={question} feedback={picked !== undefined ? question.explain : undefined} />
                </div>
              );
            }
            if (question.kind === "text") {
              return (
                <div key={question.id} className="quiz-question rise rounded-[20px] border border-line bg-surface/70 p-4 sm:p-5" style={{ animationDelay: `${questionIndex * 70}ms` }}>
                  <p className="mb-3 text-sm font-semibold text-info">Atividade {questionIndex + 1} de {unit.questions.length} · Resposta curta</p>
                  <label htmlFor={question.id} className="text-base font-semibold leading-6">
                    <InlineCode text={question.prompt} />
                  </label>
                  <textarea
                    id={question.id}
                    name={question.id}
                    required
                    minLength={question.min}
                    rows={4}
                    className="mt-3 w-full rounded-[16px] border border-line-strong bg-ink px-4 py-3 text-base leading-7 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                  />
                  {picked !== undefined ? (
                    <p className="mt-2 text-sm leading-relaxed text-danger"><InlineCode text={question.explain} /></p>
                  ) : null}
                </div>
              );
            }
            const choices = shuffleChoices(question.choices, attempts + 1);
            return (
              <fieldset key={question.id} className="quiz-question rise space-y-3 rounded-[20px] border border-line bg-surface/70 p-4 sm:p-5" style={{ animationDelay: `${questionIndex * 70}ms` }}>
                <legend className="px-2 text-base font-semibold leading-6"><span className="mb-2 block text-sm font-semibold text-info">Atividade {questionIndex + 1} de {unit.questions.length} · Escolher</span><InlineCode text={question.prompt} /></legend>
                {choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="quiz-choice flex min-h-14 cursor-pointer items-start gap-3 rounded-[16px] border border-line-strong bg-ink/70 px-4 py-3 text-base leading-6 transition hover:border-accent/50 hover:bg-accent/[0.04] has-[:checked]:border-accent has-[:checked]:bg-accent/10"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={choice.id}
                      required
                      className="mt-1 size-5 shrink-0 accent-[#d6ff4a]"
                    />
                    <span><InlineCode text={choice.label} /></span>
                  </label>
                ))}
                {picked !== undefined ? (
                  <p className="text-sm leading-relaxed text-danger">
                    <InlineCode
                      text={
                        question.choices.find((choice) => choice.id === picked)?.explain ??
                        question.choices.find((choice) => !choice.correct)?.explain ??
                        ""
                      }
                    />
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
      className="sticky bottom-3 z-10 mt-8 grid w-full gap-2 rounded-[20px] border border-line-strong bg-ink/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur sm:flex sm:items-center sm:rounded-full"
    >
      <input type="hidden" name="unit" value={unitId} />
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Marcar como lida
      </button>
      {hasQuiz ? (
        <a
          href="#quiz"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
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
