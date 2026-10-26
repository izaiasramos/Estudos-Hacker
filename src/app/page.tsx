import Link from "next/link";
import { PrimaryLink } from "@/components/primary-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrailMap } from "@/components/trail-map";

const BENEFITS = [
  { icon: "⌁", title: "Prática guiada", body: "Exercícios com contexto, pistas e explicações para você avançar no seu ritmo." },
  { icon: "✓", title: "Correção comprovada", body: "Testes mostram quando a vulnerabilidade foi corrigida sem quebrar a aplicação." },
  { icon: "◌", title: "Ambiente protegido", body: "Simulações isoladas, sem dados reais e sem acesso a sistemas de outras pessoas." },
];

const STEPS = [
  { index: "01", title: "Entenda o risco", body: "Veja como a vulnerabilidade acontece, com linguagem direta e exemplos visuais." },
  { index: "02", title: "Pratique com segurança", body: "Explore uma aplicação fictícia em um laboratório isolado e controlado." },
  { index: "03", title: "Aplique a correção", body: "Ajuste o código e confirme com testes que a aplicação continua funcionando." },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ conta?: string }> }) {
  const { conta } = await searchParams;

  return (
    <div className="relative isolate min-h-full overflow-x-hidden">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[980px]" />
      <div aria-hidden className="veil pointer-events-none absolute inset-x-0 top-0 h-[980px]" />
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink">
        Pular para o conteúdo principal
      </a>
      <SiteHeader />
      <main id="conteudo">
        {conta === "excluida" ? (
          <p role="status" className="relative mx-auto w-full max-w-6xl px-5 pb-4 text-sm text-defense sm:px-8">
            Sua conta e todo o histórico de aprendizagem foram excluídos.
          </p>
        ) : null}

        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:gap-10 lg:pb-28 lg:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
              <span aria-hidden className="size-2 rounded-full bg-accent shadow-[0_0_12px_rgba(214,255,74,0.8)]" />
              Segurança de aplicações, passo a passo
            </p>
            <h1 className="mt-6 max-w-[15ch] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.15rem]">
              Aprenda a encontrar riscos. Pratique como corrigir.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Uma jornada prática e segura para quem desenvolve software e quer criar aplicações mais protegidas — com ou sem experiência em segurança.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <PrimaryLink href="/criar-conta">Começar gratuitamente</PrimaryLink>
              <Link href="/#metodo" className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong bg-surface/60 px-6 text-sm font-semibold text-text transition hover:border-accent/50 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
                Ver como funciona
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted">
              <span aria-hidden className="text-defense">✓</span>
              Não exige conhecimento prévio em segurança.
            </p>
          </div>
          <TrailMap />
        </section>

        <section aria-label="Benefícios da plataforma" className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <ul className="grid gap-4 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="rounded-[20px] border border-line bg-surface/75 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-info/10 text-xl text-info">{benefit.icon}</span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="metodo" aria-labelledby="metodo-titulo" className="relative mx-auto w-full max-w-6xl scroll-mt-8 px-5 pb-24 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent">Como funciona</p>
            <h2 id="metodo-titulo" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Da compreensão à correção, sem pular etapas.</h2>
            <p className="mt-4 text-base leading-7 text-muted">Cada trilha transforma um tema complexo em uma sequência curta, visual e prática.</p>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.index} className="rise relative overflow-hidden rounded-[20px] border border-line bg-surface-raised p-6" style={{ animationDelay: `${index * 90}ms` }}>
                <span aria-hidden className="absolute -right-3 -top-8 font-mono text-8xl font-semibold text-white/[0.035]">{step.index}</span>
                <p className="font-mono text-sm font-semibold tracking-[0.12em] text-accent">PASSO {step.index}</p>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contrato" aria-labelledby="contrato-titulo" className="relative mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <div id="regras" className="grid gap-6 rounded-[24px] border border-defense/25 bg-[linear-gradient(120deg,rgba(62,224,176,0.10),rgba(18,20,28,0.9))] p-6 sm:p-8 md:grid-cols-[auto_1fr]">
            <span aria-hidden className="grid size-12 place-items-center rounded-2xl border border-defense/30 bg-defense/10 text-2xl text-defense">♢</span>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-defense">Prática responsável</p>
              <h2 id="contrato-titulo" className="mt-2 text-2xl font-semibold tracking-tight">Aprender com segurança também é respeitar limites.</h2>
              <p className="mt-3 text-base leading-7 text-muted">Todos os exercícios acontecem em ambientes controlados da ShieldPath. As técnicas são apresentadas para prevenção e só devem ser usadas em sistemas próprios ou com autorização explícita.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
