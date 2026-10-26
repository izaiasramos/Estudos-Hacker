import { LabBootButton, LabFrame } from "@/components/lab-boot";
import { activeLab, labIsLive, labRuntimeLabel, lastCheck, minutesLeft } from "@/lib/lab-runtime";

export async function LabDesk({ userId }: { userId: string }) {
  const session = await activeLab(userId);
  const checks = session ? await lastCheck(userId) : null;
  const live = session && labIsLive(session);

  return (
    <section className="mt-8 rounded-[16px] border border-white/10 bg-ink p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
        Ambiente isolado e autorizado
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A Pizzaria do Lab cria uma sessão só para você, por 75 minutos. Use apenas este ambiente.
        Alice entra com alice@lab.local e a senha pizza-lab; pela regra do cenário, a lista dela
        não deve conter pedidos de Bruno.
      </p>
      {live ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-text">
            No ar · {labRuntimeLabel(session)} · {minutesLeft(session)} min
          </p>
          <LabFrame
            src={session.runtime === "embedded" ? "/lab/pizzaria" : `http://127.0.0.1:${session.port}/`}
          />
          <p className="text-sm leading-relaxed text-muted">
            O verificador automatizado abaixo faz requisições pela Web usando HTTP (Protocolo de
            Transferência de Hipertexto) e relata as respostas observadas. Essas verificações não
            substituem uma revisão da consulta no código.
          </p>
          <form action="/api/lab/session/check" method="post">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink"
            >
              Executar verificações da sessão
            </button>
          </form>
        </div>
      ) : (
        <LabBootButton />
      )}
      {checks ? (
        <ul className="mt-4 space-y-2">
          {checks.map((item) => (
            <li key={item.name} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span className={item.ok ? "text-defense" : "text-danger"}>
                {item.ok ? "Resposta esperada" : "Resposta divergente"}
              </span>
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
