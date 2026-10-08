import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthHardeningLab } from "@/components/auth-hardening-lab";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UnitRail } from "@/components/unit-rail";
import { UNITS } from "@/content/autenticacao";
import type { CalloutTone, Unit } from "@/content/sql-injection";
import { getCurrentUser } from "@/lib/current-user";
import { listProgress, nextUnit, shuffleChoices, unitStatus } from "@/lib/trail-progress";

const CALLOUT: Record<CalloutTone, string> = {
  conceito: "Conceito",
  analogia: "Analogia",
  armadilha: "Armadilha comum",
  dev: "Como um dev vê isso",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unit: string }>;
}): Promise<Metadata> {
  const { unit: unitId } = await params;
  const unit = UNITS.find((item) => item.id === unitId);
  return { title: unit ? `${unit.title} — ShieldPath` : "Autenticação — ShieldPath" };
}

export default async function AuthUnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ unit: string }>;
  searchParams: Promise<{ ok?: string; resp?: string; falta?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const { unit: unitId } = await params;
  const unit = UNITS.find((item) => item.id === unitId);
  if (!unit) notFound();

  const progress = await listProgress(user.id);
  const status = unitStatus(unit, progress, true);
  if (status === "bloqueada") redirect("/trilha/autenticacao");

  const query = await searchParams;
  const wrong = readResponses(query.resp);
  const passedNow = query.ok !== undefined && status === "concluída";
  const following = nextUnit(progress, true, "autenticacao");
  const missing = (query.falta ?? "").split(",").filter(Boolean);

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <SiteHeader />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 sm:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          <UnitRail currentId={unit.id} progress={progress} ethicsDone units={UNITS} basePath="/trilha/autenticacao" />
        </div>
        <div className="grid flex-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="sticky top-6 hidden self-start lg:block">
            <UnitRail currentId={unit.id} progress={progress} ethicsDone units={UNITS} basePath="/trilha/autenticacao" />
          </aside>
          <article className="mx-auto w-full max-w-[68ch] rounded-[16px] border border-white/10 bg-surface/80 px-5 py-8 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Unidade {unit.order} · {status}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{unit.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">{unit.summary}</p>
            <Blocks unit={unit} />
            {unit.id === "auth-lab" ? (
              <AuthHardeningLab done={status === "concluída"} missing={missing} />
            ) : null}
            <Quiz
              unit={unit}
              wrong={wrong}
              passedNow={passedNow}
              score={query.ok}
              followingHref={following ? `/trilha/autenticacao/${following.id}` : "/trilha/autenticacao"}
              followingLabel={following?.title ?? "Ver a trilha"}
              attempts={progress.get(unit.id)?.attempts ?? 0}
              done={status === "concluída"}
            />
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

function Quiz({
  unit,
  wrong,
  passedNow,
  score,
  followingHref,
  followingLabel,
  attempts,
  done,
}: {
  unit: Unit;
  wrong: Map<string, string>;
  passedNow: boolean;
  score?: string;
  followingHref: string;
  followingLabel: string;
  attempts: number;
  done: boolean;
}) {
  if (unit.questions.length === 0) return null;
  return (
    <section id="quiz" className="mt-10 scroll-mt-24 border-t border-white/10 pt-8">
      <h2 className="text-lg font-semibold tracking-tight">
        {unit.kind === "exercise" ? "Exercício" : unit.kind === "checkpoint" ? "Checkpoint" : "Quiz"}
      </h2>
      {passedNow ? (
        <p className="mt-3 text-sm leading-relaxed text-defense" role="status">
          {score}% — esta unidade ficou para trás.
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
                    {question.choices.find((choice) => choice.id === picked)?.explain}
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
          {followingLabel === "Ver a trilha" ? followingLabel : `Seguir — ${followingLabel}`}
        </Link>
      ) : null}
      {unit.kind !== "lab" && !done ? (
        <form action="/api/trilha/ler" method="post" className="mt-8">
          <input type="hidden" name="unit" value={unit.id} />
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full px-4 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Marcar como lida
          </button>
        </form>
      ) : null}
    </section>
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
