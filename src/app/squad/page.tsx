import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { squadOf, squadStandings, type Standing } from "@/lib/squad";

export const metadata: Metadata = {
  title: "Time — ShieldPath",
};

const ERRORS: Record<string, string> = {
  nome: "O nome do time precisa ter entre 2 e 32 caracteres.",
  ja: "Você já está em um time.",
  codigo: "Esse código não é de um time.",
  mentor: "Quem abriu o time encerra o grupo. Os outros podem sair.",
  fora: "Você não está em um time.",
};

export default async function SquadPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const query = await searchParams;
  const squad = await squadOf(user.id);
  const error = query.erro ? ERRORS[query.erro] : null;

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Time</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {squad ? squad.name : "Montar o time"}
        </h1>
        {error ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {squad ? (
          <Board squadId={squad.id} code={squad.code} mentor={squad.mentorId === user.id} you={user.id} />
        ) : (
          <Join />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Join() {
  return (
    <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
      <form action="/api/squad" method="post" className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
        <input type="hidden" name="intent" value="criar" />
        <h2 className="text-lg font-semibold">Abrir um time</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Você vira mentor. O código serve para o grupo entrar.
        </p>
        <label htmlFor="name" className="mt-4 block text-sm">
          Nome do time
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={32}
          className="mt-2 w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        <button
          type="submit"
          className="mt-4 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Abrir time
        </button>
      </form>
      <form action="/api/squad" method="post" className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
        <input type="hidden" name="intent" value="entrar" />
        <h2 className="text-lg font-semibold">Entrar com código</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          O quadro mostra a nota, as tentativas e a ordem do time.
        </p>
        <label htmlFor="code" className="mt-4 block text-sm">
          Código
        </label>
        <input
          id="code"
          name="code"
          required
          autoCapitalize="characters"
          className="mt-2 w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 font-mono text-sm uppercase outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        <button
          type="submit"
          className="mt-4 inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Entrar no time
        </button>
      </form>
    </div>
  );
}

async function Board({
  squadId,
  code,
  mentor,
  you,
}: {
  squadId: string;
  code: string;
  mentor: boolean;
  you: string;
}) {
  const board = await squadStandings(squadId);
  return (
    <>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        {board.people} {board.people === 1 ? "pessoa" : "pessoas"} no time. A nota é a média das
        unidades já pontuadas. A ordem segue essa média. No empate, menos tentativas fica na frente.
      </p>
      <p className="mt-4 font-mono text-sm text-text">Código · {code}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Hoje</p>
          <p className="mt-2 text-3xl font-semibold">{board.studiedToday}</p>
          <p className="mt-1 text-sm text-muted">
            {board.studiedToday === 1 ? "pessoa estudou hoje" : "pessoas estudaram hoje"}
          </p>
        </article>
        {board.seals.map((trail) => (
          <article key={trail.slug} className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{trail.title}</p>
            <p className="mt-2 text-3xl font-semibold">{trail.seals}</p>
            <p className="mt-1 text-sm text-muted">
              {trail.seals === 1 ? "selo fechado" : "selos fechados"}
            </p>
          </article>
        ))}
      </div>
      <Ranking title="Ranking geral" rows={board.overall} you={you} />
      {board.trails.map((trail) => (
        <Ranking key={trail.slug} title={`Ranking · ${trail.title}`} rows={trail.rows} you={you} />
      ))}
      {mentor ? (
        <form action="/api/squad/close" method="post" className="mt-10">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm text-text"
          >
            Encerrar o time
          </button>
        </form>
      ) : (
        <form action="/api/squad/leave" method="post" className="mt-10">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm text-text"
          >
            Sair do time
          </button>
        </form>
      )}
    </>
  );
}

function Ranking({ title, rows, you }: { title: string; rows: Standing[]; you: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ol className="mt-4 space-y-2">
        <li className="hidden px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:grid sm:grid-cols-[3rem_minmax(0,1.4fr)_5rem_8rem_minmax(0,1fr)]">
          <span>#</span>
          <span>Nome</span>
          <span>Nota</span>
          <span>Tentativas</span>
          <span>Onde</span>
        </li>
        {rows.map((row) => (
          <li
            key={row.userId}
            className={`grid items-center gap-3 rounded-[16px] border px-4 py-3 sm:grid-cols-[3rem_minmax(0,1.4fr)_5rem_8rem_minmax(0,1fr)] ${
              row.userId === you ? "border-accent/50 bg-accent/10" : "border-white/10 bg-surface/80"
            }`}
          >
            <span className="font-mono text-sm text-accent">{row.rank}</span>
            <span className="truncate text-sm font-semibold">
              {row.name}
              {row.userId === you ? <span className="ml-2 font-normal text-muted">você</span> : null}
            </span>
            <span className="font-mono text-sm">{row.score === null ? "—" : row.score}</span>
            <span className="text-sm text-muted">
              {row.attempts === 1 ? "1 tentativa" : `${row.attempts} tentativas`}
            </span>
            <span className="text-sm text-muted">{row.place}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
