import { activeLab, lastCheck, minutesLeft } from "@/lib/lab-runtime";

export async function LabDesk({ userId }: { userId: string }) {
  const session = await activeLab(userId);
  const checks = session ? await lastCheck(userId) : null;

  return (
    <section className="mt-8 rounded-[16px] border border-white/10 bg-ink p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Ambiente isolado</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A Pizzaria do Lab sobe só para você, por 75 minutos, sem privilégio de administrador.
        Alice entra com alice@lab.local e a senha pizza-lab. Bruno não aparece na lista dela.
      </p>
      {session?.port ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-text">
            No ar · {session.runtime === "docker" ? "container" : "processo local"} ·{" "}
            {minutesLeft(session)} min
          </p>
          <iframe
            title="Pizzaria do Lab"
            src={`http://127.0.0.1:${session.port}/`}
            className="h-80 w-full rounded-[16px] border border-white/10 bg-ink"
          />
          <form action="/api/lab/session/check" method="post">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink"
            >
              Rodar checker HTTP
            </button>
          </form>
        </div>
      ) : (
        <form action="/api/lab/session" method="post" className="mt-4">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink"
          >
            Iniciar ambiente
          </button>
        </form>
      )}
      {checks ? (
        <ul className="mt-4 space-y-2">
          {checks.map((item) => (
            <li key={item.name} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span className={item.ok ? "text-defense" : "text-danger"}>{item.ok ? "Verde" : "Falhou"}</span>
              <span className="mx-2 text-white/20">·</span>
              {item.name}
              <span className="mt-1 block text-muted">{item.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
