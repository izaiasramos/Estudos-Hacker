import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Regras do jogo — ShieldPath",
};

const EXPLANATIONS: Record<string, string> = {
  alvo: "O único alvo permitido é o laboratório da plataforma. Sistema de terceiros, inclusive o da empresa, só existe com autorização explícita — e não é este produto.",
  selo: "O selo sai depois da defesa. Reproduzir o problema no lab ainda não fecha a trilha.",
  aceite: "Para seguir, confirme que a prática fica no laboratório próprio.",
};

export default async function RegrasPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (user.ethicsAcceptedAt) redirect("/inicio");

  const params = await searchParams;
  const wrong = new Set((params.err ?? "").split(",").filter(Boolean));

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-[68ch] flex-1 px-5 py-10 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          Unidade 0
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Regras do jogo</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Esta unidade é a porta da trilha. Sem ela, laboratório nenhum abre.
        </p>

        <div className="mt-8 space-y-4">
          <article className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Conceito</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Laboratório autorizado é o app fictício que a plataforma sobe para você.
              Site, API ou conta de outra pessoa não é laboratório.
            </p>
          </article>
          <article className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Como um dev vê isso
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              “Posso testar o sistema da empresa?” Só com um programa ou uma autorização
              por escrito. Ser júnior do time não é essa autorização.
            </p>
          </article>
          <article className="rounded-[16px] border border-white/10 bg-surface/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Armadilha comum
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              O selo não premia quem reproduziu o problema. Ele premia quem fechou o buraco
              e ainda deixou a funcionalidade de pé.
            </p>
          </article>
        </div>

        <form action="/api/auth/ethics" method="post" className="mt-10 space-y-8">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Onde a prática deste produto pode acontecer?
            </legend>
            <Radio name="alvo" value="qualquer" label="Em qualquer site que pareça vulnerável" />
            <Radio name="alvo" value="lab" label="Só no laboratório da plataforma" />
            <Radio name="alvo" value="empresa" label="No sistema da empresa, porque eu trabalho lá" />
            {wrong.has("alvo") ? <Explain text={EXPLANATIONS.alvo} /> : null}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Quando o selo da trilha é emitido?</legend>
            <Radio name="selo" value="ataque" label="Depois de reproduzir o problema no lab" />
            <Radio name="selo" value="defesa" label="Depois de fechar o buraco na defesa" />
            <Radio name="selo" value="video" label="Depois de ler a teoria" />
            {wrong.has("selo") ? <Explain text={EXPLANATIONS.selo} /> : null}
          </fieldset>

          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
            <input
              type="checkbox"
              name="aceite"
              value="sim"
              className="mt-1 size-4 accent-[#d6ff4a]"
            />
            <span>Li as regras e vou praticar só no laboratório próprio.</span>
          </label>
          {wrong.has("aceite") ? <Explain text={EXPLANATIONS.aceite} /> : null}

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-ink transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Confirmar e continuar
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Radio({ name, value, label }: { name: string; value: string; label: string }) {
  return (
    <label className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-ink/40 px-4 py-3 text-sm text-text">
      <input type="radio" name={name} value={value} className="mt-1 accent-[#d6ff4a]" required />
      <span>{label}</span>
    </label>
  );
}

function Explain({ text }: { text: string }) {
  return (
    <p role="alert" className="text-sm leading-relaxed text-danger">
      {text}
    </p>
  );
}
