import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authError } from "@/lib/auth-errors";

export const metadata: Metadata = {
  title: "Criar conta — ShieldPath",
};

export default async function CriarContaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <div aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Conta</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Criar conta</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          E-mail ou Google. O progresso da trilha fica nesta conta.
        </p>
        <AuthForm mode="signup" error={authError(params.erro)} />
        <p className="mt-6 text-sm text-muted">
          Já tem conta?{" "}
          <Link
            href="/entrar"
            className="text-text underline decoration-white/20 underline-offset-4 hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Entrar
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
