import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { hasSeal, listProgress } from "@/lib/trail-progress";

export const metadata: Metadata = {
  title: "Selo de SQL Injection — ShieldPath",
};

export default async function SealPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const progress = await listProgress(user.id);
  if (!hasSeal(progress)) redirect("/trilha/sql-injection");

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Especialidade</p>
        <div className="relative mt-8 grid size-28 place-items-center">
          <span className="seal-ring absolute inset-0 rounded-full border border-accent" />
          <span className="seal-core grid size-16 place-items-center rounded-full bg-accent text-lg font-semibold text-ink">
            SQL
          </span>
        </div>
        <h1 className="seal-name mt-8 text-3xl font-semibold tracking-tight">SQL Injection</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Você explicou a fronteira e fechou as duas consultas do lab. O login da Alice continua
          válido. O pedido do Bruno fica de fora.
        </p>
        <Link
          href="/inicio"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink"
        >
          Voltar ao início
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
