import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PUBLISHED_TRAILS as TRAILS } from "@/content/trails";
import { getCurrentUser } from "@/lib/current-user";
import { squadOf } from "@/lib/squad";
import { readStreak } from "@/lib/streak";
import { accountLevel, hasTrailSeal, listProgress, nextUnit, sealDate } from "@/lib/trail-progress";
import { lastLabStartedAt } from "@/lib/users";

export const metadata: Metadata = {
  title: "Perfil — ShieldPath",
};

const ERRORS: Record<string, string> = {
  nome: "O nome precisa ter entre 2 e 60 caracteres.",
  origem: "Não foi possível confirmar a origem do pedido.",
  confirmar: "O e-mail digitado não é o desta conta. Nada foi apagado.",
  senha: "A senha não confere. Nada foi apagado.",
  bloqueado: "Muitas tentativas de senha seguidas. Espere até 15 minutos. Nada foi apagado.",
};

const DATE = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "America/Sao_Paulo",
});

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const INPUT =
  "mt-2 w-full rounded-[16px] border border-white/10 bg-ink px-4 py-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.ethicsAcceptedAt) redirect("/regras");

  const query = await searchParams;
  const error = query.erro ? (ERRORS[query.erro] ?? null) : null;
  const saved = query.ok === "nome" ? "Nome atualizado." : query.ok === "movimento" ? "Preferência de movimento salva." : null;

  const [progress, { streak }, squad, lastLab] = await Promise.all([
    listProgress(user.id),
    readStreak(user.id),
    squadOf(user.id),
    lastLabStartedAt(user.id),
  ]);

  const trails = TRAILS.map((trail) => {
    const sealed = hasTrailSeal(progress, trail.sealId);
    const done = trail.units.filter((unit) => progress.get(unit.id)?.status === "done").length;
    const upcoming = sealed ? null : nextUnit(progress, true, trail.slug);
    const earnedAt = sealDate(progress, trail.sealId);
    return { trail, sealed, done, total: trail.units.length, upcoming, earnedAt };
  });
  const seals = trails.filter((item) => item.sealed).length;
  const level = accountLevel(seals);
  const streakLabel =
    streak === 0 ? "Nenhum dia fechado" : streak === 1 ? "1 dia" : `${streak} dias seguidos`;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const isMentor = squad?.mentorId === user.id;

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Perfil</p>

        <div className="mt-4 flex items-center gap-4">
          <span
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-full border border-accent/50 bg-accent/10 text-2xl font-semibold text-accent"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-4xl font-semibold tracking-tight">{user.name}</h1>
            <p className="mt-1 truncate text-sm text-muted">
              {user.email}
              <span className="mx-2 text-white/20">·</span>
              {user.provider === "google" ? "Google" : "E-mail e senha"}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="mt-6 text-sm text-defense" role="status">
            {saved}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="XP" value={String(user.xp)} />
          <Stat label="Nível" value={level} />
          <Stat label="Sequência" value={streakLabel} />
          <Stat
            label="Último lab"
            value={lastLab ? DATE_TIME.format(new Date(lastLab)) : "Nenhum ainda"}
          />
        </dl>
        <p className="mt-3 text-sm text-muted">
          Conta criada em {DATE.format(new Date(user.createdAt))}.
          {squad ? ` Time: ${squad.name}${isMentor ? " (você é mentor)" : ""}.` : ""}
        </p>

        <section aria-labelledby="selos-titulo" className="mt-12">
          <h2 id="selos-titulo" className="text-xl font-semibold">
            Selos · {seals} de {TRAILS.length}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trails.map(({ trail, sealed, done, total, upcoming, earnedAt }) => (
              <li key={trail.slug}>
                <Link
                  href={sealed ? `/trilha/${trail.slug}/selo` : `/trilha/${trail.slug}`}
                  className={`block rounded-[16px] border p-5 ${FOCUS} ${
                    sealed ? "border-accent/40 bg-accent/5" : "border-dashed border-white/15 bg-surface/60"
                  }`}
                >
                  <p
                    className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
                      sealed ? "text-accent" : "text-muted"
                    }`}
                  >
                    {sealed
                      ? earnedAt
                        ? `Selo fechado · ${DATE.format(new Date(earnedAt))}`
                        : "Selo fechado"
                      : "Selo pendente"}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{trail.title}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {sealed
                      ? `${done} de ${total} unidades concluídas.`
                      : upcoming
                        ? `${done} de ${total} · próxima: ${upcoming.title}`
                        : `${done} de ${total} unidades concluídas.`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="nome-titulo" className="mt-12 max-w-xl">
          <h2 id="nome-titulo" className="text-xl font-semibold">
            Nome de exibição
          </h2>
          <p className="mt-2 text-sm text-muted">É o nome que o time vê no ranking.</p>
          <form action="/api/perfil" method="post" className="mt-4">
            <label htmlFor="name" className="block text-sm">
              Nome
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={user.name}
              autoComplete="name"
              className={INPUT}
            />
            <button
              type="submit"
              className={`mt-4 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink ${FOCUS}`}
            >
              Salvar nome
            </button>
          </form>
        </section>

        <section id="movimento" aria-labelledby="movimento-titulo" className="mt-12 max-w-xl">
          <h2 id="movimento-titulo" className="text-xl font-semibold">
            Movimento
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Desliga o traço da trilha, o pulso do nó atual, o shake do quiz e a cena do selo. O
            estado continua escrito em cada tela. Se o sistema já pede menos movimento, o app segue o
            sistema mesmo com esta opção desligada.
          </p>
          <form action="/api/perfil/movimento" method="post" className="mt-4 space-y-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="reduce"
                value="on"
                defaultChecked={user.reduceMotion}
                className="mt-1 accent-[#d6ff4a]"
              />
              Reduzir movimento
            </label>
            <button
              type="submit"
              className={`inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm text-text ${FOCUS}`}
            >
              Salvar preferência
            </button>
          </form>
        </section>

        <section
          id="excluir"
          aria-labelledby="excluir-titulo"
          className="mt-16 max-w-xl rounded-[16px] border border-danger/40 bg-danger/5 p-6"
        >
          <h2 id="excluir-titulo" className="text-xl font-semibold">
            Excluir conta
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Apaga a conta, o progresso, o XP, os selos e o histórico de laboratório. O ambiente
            ativo é encerrado. Não há como desfazer.
          </p>
          {isMentor ? (
            <p className="mt-3 text-sm leading-relaxed text-danger">
              Você abriu o time {squad?.name}. Excluir a conta encerra o time para todo mundo.
            </p>
          ) : squad ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Você sai do time {squad.name}.
            </p>
          ) : null}
          <form action="/api/perfil/excluir" method="post" className="mt-5 space-y-4">
            <div>
              <label htmlFor="confirm-email" className="block text-sm">
                Digite <span className="font-mono">{user.email}</span> para confirmar
              </label>
              <input
                id="confirm-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                className={INPUT}
              />
            </div>
            {user.passwordHash ? (
              <div>
                <label htmlFor="confirm-password" className="block text-sm">
                  Senha atual
                </label>
                <input
                  id="confirm-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={INPUT}
                />
              </div>
            ) : null}
            <button
              type="submit"
              className={`inline-flex h-12 items-center rounded-full border border-danger px-6 text-sm font-semibold text-danger transition hover:bg-danger hover:text-ink ${FOCUS}`}
            >
              Excluir minha conta
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold">{value}</dd>
    </div>
  );
}
