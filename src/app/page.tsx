import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PrimaryLink } from "@/components/primary-link";
import { TrailMap } from "@/components/trail-map";
import Link from "next/link";

const STEPS = [
  {
    index: "01",
    title: "Teoria curta",
    body: "Blocos de poucos minutos. O que quebrou, e por quê. Sem playbook para levar embora.",
  },
  {
    index: "02",
    title: "Lab isolado",
    body: "Um app fictício, sem saída para a internet. Você vê o buraco com dados que não são de ninguém.",
  },
  {
    index: "03",
    title: "Patch com teste verde",
    body: "O selo só sai quando o teste confirma que o vetor fechou e a feature continua de pé.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-full overflow-x-hidden">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[920px]" />
      <div aria-hidden className="veil pointer-events-none absolute inset-x-0 top-0 h-[920px]" />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">
        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:gap-6 lg:pt-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              Trilha para devs júnior
            </p>
            <h1 className="mt-4 max-w-[14ch] text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              Feche o buraco que você acabou de entender.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Aprenda o ataque no laboratório. Defenda no código. Saia com o selo.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <PrimaryLink href="/criar-conta">Criar conta</PrimaryLink>
              <Link
                href="/entrar"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Entrar com Google
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">Uso só em laboratório próprio.</p>
          </div>
          <TrailMap />
        </section>

        <section
          id="metodo"
          aria-labelledby="metodo-titulo"
          className="relative mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8"
        >
          <h2 id="metodo-titulo" className="text-sm font-medium text-muted">
            O método
          </h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.index}
                className="rise rounded-[16px] border border-white/10 bg-surface/80 p-5"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <p className="font-mono text-[11px] tracking-[0.18em] text-accent">{step.index}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="contrato"
          aria-labelledby="contrato-titulo"
          className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8"
        >
          <div id="regras" className="max-w-2xl rounded-[16px] border border-white/10 bg-surface/50 p-6 sm:p-8">
            <h2 id="contrato-titulo" className="text-lg font-semibold tracking-tight">
              Regras do jogo
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              ShieldPath é estudo. O único alvo permitido é o laboratório da plataforma.
              Técnicas contra sistemas sem autorização escrita ficam fora do produto.
              Antes de qualquer lab, a unidade Regras do jogo é obrigatória.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
