import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import type { Ranking, RankingEntry } from "@/lib/ranking";
import { accountLevel } from "@/lib/trail-progress";

const PODIUM = ["text-accent", "text-info", "text-defense"];

function Row({ entry, isMe }: { entry: RankingEntry; isMe: boolean }) {
  const podium = entry.position <= 3 ? PODIUM[entry.position - 1] : "text-muted";
  return (
    <li
      aria-current={isMe ? "true" : undefined}
      className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${
        isMe ? "border border-accent/40 bg-accent/10" : "border border-transparent"
      }`}
    >
      <span className={`w-6 shrink-0 text-center font-mono text-sm font-semibold ${podium}`}>
        {entry.position}
      </span>
      <UserAvatar userId={entry.userId} name={entry.name} hasAvatar={entry.hasAvatar} className="size-10 text-base" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {entry.name}
          {isMe ? <span className="ml-2 text-xs text-accent">você</span> : null}
        </p>
        <p className="truncate text-xs text-muted">
          {accountLevel(entry.seals)}
          {entry.seals > 0 ? ` · ${entry.seals} ${entry.seals === 1 ? "selo" : "selos"}` : ""}
        </p>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
        {entry.xp}
        <span className="ml-1 text-xs font-normal text-muted">XP</span>
      </p>
    </li>
  );
}

export function Leaderboard({ ranking, currentUserId, optedOut }: { ranking: Ranking; currentUserId: string; optedOut: boolean }) {
  return (
    <section
      aria-labelledby="ranking-titulo"
      className="rounded-[20px] border border-line bg-surface/80 p-4 backdrop-blur-sm sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 id="ranking-titulo" className="text-lg font-semibold tracking-tight">
          Ranking
        </h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {ranking.total} {ranking.total === 1 ? "pessoa" : "pessoas"}
        </p>
      </div>
      <p className="mt-1 px-1 text-xs text-muted">Por XP. Empate: mais selos, depois quem chegou primeiro.</p>
      {ranking.top.length ? (
        <ol className="mt-3 space-y-1">
          {ranking.top.map((entry) => (
            <Row key={entry.userId} entry={entry} isMe={entry.userId === currentUserId} />
          ))}
          {ranking.me ? (
            <>
              <li aria-hidden className="py-1 text-center text-muted">
                ···
              </li>
              <Row entry={ranking.me} isMe />
            </>
          ) : null}
        </ol>
      ) : (
        <p className="mt-4 px-1 text-sm text-muted">Ninguém no ranking ainda. Feche uma unidade para abrir a disputa.</p>
      )}
      {optedOut ? (
        <p className="mt-3 px-1 text-xs text-muted">
          Você está fora do ranking.{" "}
          <Link href="/perfil#ranking" className="text-text underline decoration-white/20 underline-offset-4 hover:decoration-accent">
            Voltar a aparecer
          </Link>
        </p>
      ) : null}
    </section>
  );
}
