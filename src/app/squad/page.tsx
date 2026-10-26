import type { InputHTMLAttributes } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { competitionAwards, competitionRanking, getSquadCompetition, type Competition } from "@/lib/competition";
import { getCurrentUser } from "@/lib/current-user";
import { squadOf, squadStandings, type Standing } from "@/lib/squad";

export const metadata: Metadata = { title: "Time — ShieldPath" };

const ERRORS: Record<string, string> = {
  nome: "O nome do time precisa ter entre 2 e 32 caracteres.",
  ja: "Você já está em um time.",
  codigo: "Esse código não é de um time.",
  mentor: "Esta ação é exclusiva do mentor do time.",
  fora: "Você não está em um time.",
  "nome-competicao": "O nome da competição precisa ter entre 3 e 60 caracteres.",
  premio: "Descreva o prêmio em 3 a 240 caracteres.",
  periodo: "Escolha um início futuro e um término posterior.",
  cobertura: "A cobertura mínima deve estar entre 1% e 100%.",
  premiacao: "Escolha premiação para vencedor ou top 3.",
  "competicao-existente": "O time já tem uma competição aberta.",
  "sem-competicao": "Não há competição para homologar.",
  "ainda-ativa": "A competição só pode ser homologada depois do término.",
  "competicao-aberta": "Homologue a competição aberta antes de encerrar o time.",
  "competicao-entrada": "Não é possível entrar no time enquanto houver uma competição aberta ou aguardando homologação.",
  "competicao-saida": "Não é possível sair do time enquanto houver uma competição aberta ou aguardando homologação.",
  acao: "Ação de competição inválida.",
};

export default async function SquadPage({ searchParams }: {
  searchParams: Promise<{ erro?: string; ok?: string }>;
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
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Squad</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{squad ? squad.name : "Montar o time"}</h1>
        {error ? <p className="mt-4 text-sm text-danger" role="alert">{error}</p> : null}
        {query.ok === "competicao" ? <p className="mt-4 text-sm text-defense" role="status">Competição atualizada.</p> : null}
        {squad ? <Board squadId={squad.id} code={squad.code} mentor={squad.mentorId === user.id} you={user.id} /> : <Join />}
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
        <p className="mt-2 text-sm text-muted">Você vira mentor e compartilha o código com o squad.</p>
        <label htmlFor="name" className="mt-4 block text-sm">Nome do time</label>
        <input id="name" name="name" required minLength={2} maxLength={32} className="mt-2 w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40" />
        <button type="submit" className="mt-4 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink">Abrir time</button>
      </form>
      <form action="/api/squad" method="post" className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
        <input type="hidden" name="intent" value="entrar" />
        <h2 className="text-lg font-semibold">Entrar com código</h2>
        <p className="mt-2 text-sm text-muted">Entre para acompanhar a competição e o progresso do grupo.</p>
        <label htmlFor="code" className="mt-4 block text-sm">Código</label>
        <input id="code" name="code" required autoCapitalize="characters" className="mt-2 w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 font-mono text-sm uppercase outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40" />
        <button type="submit" className="mt-4 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink">Entrar</button>
      </form>
    </div>
  );
}

async function Board({ squadId, code, mentor, you }: { squadId: string; code: string; mentor: boolean; you: string }) {
  const [board, competition] = await Promise.all([squadStandings(squadId), getSquadCompetition(squadId)]);
  const [ranking, awards] = competition
    ? await Promise.all([competitionRanking(competition.id), competitionAwards(competition.id)])
    : [[], []];
  return (
    <>
      <p className="mt-3 text-sm text-muted">{board.people} {board.people === 1 ? "pessoa" : "pessoas"} no time · código <span className="font-mono text-text">{code}</span></p>
      <CompetitionPanel competition={competition} ranking={ranking} awards={awards} mentor={mentor} you={you} />
      {mentor && (!competition || competition.status === "closed") ? <CompetitionForm /> : null}
      <section className="mt-12 border-t border-white/10 pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Progresso histórico</p>
        <h2 className="mt-2 text-2xl font-semibold">Aprendizado do squad</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">Fora da janela competitiva, a ordem prioriza cobertura concluída. A nota usa todas as unidades da trilha como denominador; selos não entram na média.</p>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Hoje" value={board.studiedToday} detail={board.studiedToday === 1 ? "pessoa estudou" : "pessoas estudaram"} />
        {board.seals.map((trail) => <Metric key={trail.slug} label={trail.title} value={trail.seals} detail="selos fechados" />)}
      </div>
      <HistoryRanking title="Geral" rows={board.overall} you={you} />
      {board.trails.map((trail) => <HistoryRanking key={trail.slug} title={trail.title} rows={trail.rows} you={you} />)}
      {mentor ? (
        <form action="/api/squad/close" method="post" className="mt-10"><button type="submit" className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm">Encerrar o time</button></form>
      ) : (
        <form action="/api/squad/leave" method="post" className="mt-10"><button type="submit" className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm">Sair do time</button></form>
      )}
    </>
  );
}

function CompetitionPanel({ competition, ranking, awards, mentor, you }: {
  competition: Competition | null;
  ranking: Awaited<ReturnType<typeof competitionRanking>>;
  awards: Awaited<ReturnType<typeof competitionAwards>>;
  mentor: boolean;
  you: string;
}) {
  if (!competition) return <section className="mt-8 rounded-[16px] border border-white/10 bg-surface/80 p-5"><h2 className="text-xl font-semibold">Competição</h2><p className="mt-2 text-sm text-muted">Ainda não há uma competição configurada.</p></section>;
  const labels: Record<Competition["status"], string> = { draft: "Agendada", active: "Em andamento", awaiting_close: "Aguardando homologação", closed: "Encerrada" };
  return (
    <section className="mt-8" aria-labelledby="competition-title">
      <div className="rounded-[16px] border border-accent/25 bg-surface/90 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{labels[competition.status]}</p>
        <h2 id="competition-title" className="mt-2 text-2xl font-semibold">{competition.name}</h2>
        <p className="mt-2 text-sm text-muted">{formatDate(competition.startsAt)} até {formatDate(competition.endsAt)} · cobertura mínima {competition.minimumCoverage}%</p>
        <p className="mt-2 text-sm"><strong>Prêmio:</strong> {competition.prizeDescription} ({competition.prizeMode === "top3" ? "top 3" : "vencedor"})</p>
        <p className="mt-2 text-sm text-muted">Cada primeira aprovação vale até 90 pontos: precisão até 60, primeira aprovação até 20 e eficiência até 10. Velocidade vale 0.</p>
        {mentor && competition.status === "awaiting_close" ? <form action="/api/squad/competition" method="post" className="mt-4"><input type="hidden" name="intent" value="close" /><button type="submit" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink">Homologar resultado</button></form> : null}
      </div>
      <div className="mt-5 overflow-x-auto rounded-[16px] border border-white/10 bg-surface/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted"><tr><th className="p-4">#</th><th>Nome</th><th>Pontos</th><th>Cobertura</th><th>1ª aprovação</th><th>Precisão</th><th>Tentativas</th><th>Elegível</th></tr></thead>
          <tbody>{ranking.map((row, index) => <tr key={row.userId} className={row.userId === you ? "bg-accent/10" : "border-t border-white/10"}><td className="p-4 font-mono text-accent">{competition.status === "closed" ? row.finalRank ?? "—" : index + 1}</td><td className="font-semibold">{row.name}{row.userId === you ? " · você" : ""}</td><td>{competition.status === "closed" ? row.finalScore ?? row.points : row.points}</td><td>{row.coverage}%</td><td>{row.firstPasses}</td><td>{row.accuracy}%</td><td>{row.attempts}</td><td>{competition.status === "closed" ? row.eligible ? "Sim" : "Não" : row.coverage >= competition.minimumCoverage ? "Sim" : "Não"}</td></tr>)}</tbody>
        </table>
      </div>
      {awards.length > 0 ? <div className="mt-5 grid gap-3 sm:grid-cols-3">{awards.map((award) => <article key={award.position} className="rounded-[16px] border border-accent/25 bg-accent/10 p-4"><p className="font-mono text-sm text-accent">{award.position}º lugar</p><h3 className="mt-2 font-semibold">{award.name}</h3><p className="mt-1 text-sm text-muted">{award.score} pontos · {award.prize_description}</p></article>)}</div> : null}
    </section>
  );
}

function CompetitionForm() {
  return (
    <form action="/api/squad/competition" method="post" className="mt-8 rounded-[16px] border border-white/10 bg-surface/80 p-5">
      <input type="hidden" name="intent" value="create" />
      <h2 className="text-xl font-semibold">Nova competição</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field id="competition-name" name="name" label="Nome" minLength={3} maxLength={60} />
        <Field id="prize" name="prizeDescription" label="Prêmio" minLength={3} maxLength={240} />
        <Field id="startsAt" name="startsAt" label="Início" type="datetime-local" />
        <Field id="endsAt" name="endsAt" label="Término" type="datetime-local" />
        <Field id="coverage" name="minimumCoverage" label="Cobertura mínima (%)" type="number" min={1} max={100} defaultValue={70} />
        <label className="text-sm">Premiação<select name="prizeMode" className="mt-2 block w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3"><option value="winner">Vencedor</option><option value="top3">Top 3</option></select></label>
      </div>
      <button type="submit" className="mt-5 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink">Criar competição</button>
    </form>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, id, ...input } = props;
  return <label htmlFor={id} className="text-sm">{label}<input id={id} required {...input} className="mt-2 block w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40" /></label>;
}
function Metric({ label, value, detail }: { label: string; value: number; detail: string }) { return <article className="rounded-[16px] border border-white/10 bg-surface/80 p-5"><p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted">{detail}</p></article>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)); }

function HistoryRanking({ title, rows, you }: { title: string; rows: Standing[]; you: string }) {
  return <section className="mt-10"><h3 className="text-xl font-semibold">{title}</h3><ol className="mt-4 space-y-2">{rows.map((row) => <li key={row.userId} className={`grid gap-3 rounded-[16px] border px-4 py-3 sm:grid-cols-[3rem_1fr_6rem_6rem_8rem_1fr] ${row.userId === you ? "border-accent/50 bg-accent/10" : "border-white/10 bg-surface/80"}`}><span className="font-mono text-accent">{row.rank}</span><span className="font-semibold">{row.name}{row.userId === you ? " · você" : ""}</span><span>{row.coverage}%</span><span>{row.score === null ? "—" : row.score}</span><span>{row.attempts} tentativas</span><span className="text-muted">{row.place}</span></li>)}</ol></section>;
}
