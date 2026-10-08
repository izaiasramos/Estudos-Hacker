import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TRAILS } from "@/content/trails";
import { isAdmin } from "@/lib/access";
import { trailFunnel, weekAgoDay } from "@/lib/admin-metrics";
import { getCurrentUser } from "@/lib/current-user";
import { many, one } from "@/lib/db";
import { labRuntimeLabel, listRunningLabs, minutesLeft } from "@/lib/lab-runtime";

export const metadata: Metadata = {
  title: "Admin — ShieldPath",
  robots: { index: false },
};

const MESSAGES: Record<string, { tone: "ok" | "erro"; text: string }> = {
  "ok:lab": { tone: "ok", text: "Lab derrubado." },
  "erro:lab": { tone: "erro", text: "Esse lab já não estava no ar." },
  "erro:origem": { tone: "erro", text: "Não foi possível confirmar a origem do pedido." },
};

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  // Não é admin: a página não existe. A checagem mora aqui, no servidor, não no link do cabeçalho.
  if (!isAdmin(user)) notFound();

  const query = await searchParams;
  const message = query.ok ? MESSAGES[`ok:${query.ok}`] : query.erro ? MESSAGES[`erro:${query.erro}`] : undefined;

  const [doneRows, accounts, labs] = await Promise.all([
    many<{ unit_id: string; total: string | number }>(
      "SELECT unit_id, COUNT(*) AS total FROM progress WHERE status = 'done' GROUP BY unit_id",
    ),
    one<{ total: string | number; ethics: string | number; week: string | number }>(
      `SELECT COUNT(*) AS total,
              COUNT(ethics_accepted_at) AS ethics,
              COUNT(*) FILTER (WHERE last_study_on >= ?) AS week
       FROM users`,
      [weekAgoDay()],
    ),
    listRunningLabs(),
  ]);

  const doneByUnit = new Map(doneRows.map((row) => [row.unit_id, Number(row.total)]));
  const funnels = TRAILS.map((trail) => trailFunnel(trail, doneByUnit));

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Admin</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Operação</h1>
        <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">
          Números agregados. Nenhuma resposta de quiz nem progresso individual aparece aqui.
        </p>

        {message ? (
          <p
            role={message.tone === "erro" ? "alert" : "status"}
            className={`mt-6 text-sm ${message.tone === "erro" ? "text-danger" : "text-defense"}`}
          >
            {message.text}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Contas" value={Number(accounts?.total ?? 0)} />
          <Stat label="Passaram pelas regras" value={Number(accounts?.ethics ?? 0)} />
          <Stat label="Estudaram em 7 dias" value={Number(accounts?.week ?? 0)} />
        </dl>

        <section aria-labelledby="funil-titulo" className="mt-12">
          <h2 id="funil-titulo" className="text-xl font-semibold">
            Funil por trilha
          </h2>
          <p className="mt-2 max-w-[68ch] text-sm text-muted">
            “Chegou ao lab” é quem concluiu a unidade anterior ao lab defensivo. A taxa é o número
            central da seção 19: de quem chegou, quantos fecharam a defesa.
          </p>
          <div className="mt-4 overflow-x-auto rounded-[16px] border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Contas que concluíram cada etapa, por trilha</caption>
              <thead className="bg-surface/80 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Trilha</th>
                  <th scope="col" className="px-4 py-3 text-right">Começaram</th>
                  <th scope="col" className="px-4 py-3 text-right">Chegaram ao lab</th>
                  <th scope="col" className="px-4 py-3 text-right">Lab fechado</th>
                  <th scope="col" className="px-4 py-3 text-right">Taxa do lab</th>
                  <th scope="col" className="px-4 py-3 text-right">Selos</th>
                </tr>
              </thead>
              <tbody>
                {funnels.map((row) => (
                  <tr key={row.slug} className="border-t border-white/10">
                    <th scope="row" className="px-4 py-3 font-medium">
                      <Link href={`/trilha/${row.slug}`} className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        {row.title}
                      </Link>
                      {row.draft ? (
                        <span className="ml-2 rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                          rascunho
                        </span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">{row.started}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.beforeLab}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.labDone}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.labRate === null ? "—" : `${row.labRate}%`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.sealed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Publicar ou voltar para rascunho é pelo Git: o campo <code className="font-mono">status</code> da
            trilha em <code className="font-mono">src/content/trails.ts</code>. Rascunho só aparece para admin.
          </p>
        </section>

        <section id="labs" aria-labelledby="labs-titulo" className="mt-12 scroll-mt-24">
          <h2 id="labs-titulo" className="text-xl font-semibold">
            Labs no ar · {labs.length}
          </h2>
          {labs.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhum ambiente ligado agora.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {labs.map((lab) => {
                const zombie = lab.zombie;
                return (
                  <li
                    key={lab.id}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-[16px] border p-4 ${
                      zombie ? "border-danger/40 bg-danger/5" : "border-white/10 bg-surface/60"
                    }`}
                  >
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium">{lab.email}</p>
                      <p className="mt-1 text-muted">
                        {labRuntimeLabel(lab)} · desde {DATE_TIME.format(new Date(lab.startedAt))} ·
                        expira em {minutesLeft(lab)} min
                        {zombie ? <span className="ml-2 text-danger">possível zumbi</span> : null}
                      </p>
                    </div>
                    <form action="/api/admin/lab/stop" method="post">
                      <input type="hidden" name="session" value={lab.id} />
                      <button
                        type="submit"
                        aria-label={`Derrubar o lab de ${lab.email}`}
                        className="inline-flex h-10 items-center rounded-full border border-danger px-4 text-sm font-semibold text-danger transition hover:bg-danger hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Derrubar
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
