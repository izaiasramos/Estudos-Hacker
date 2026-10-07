import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { activeLab, minutesLeft } from "@/lib/lab-runtime";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const lab = user ? await activeLab(user.id) : null;

  return (
    <>
    {lab ? (
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-accent px-5 py-2 text-sm font-semibold text-ink sm:px-8">
        <p>Ambiente ativo · {minutesLeft(lab)} min</p>
        <form action="/api/lab/session/stop" method="post">
          <button type="submit" className="rounded-full bg-ink px-3 py-1 text-xs text-text">
            Encerrar
          </button>
        </form>
      </div>
    ) : null}
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Link
        href={user ? "/inicio" : "/"}
        className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-full border border-accent/50 bg-accent/10"
        >
          <span className="size-2 rounded-full bg-accent" />
        </span>
        <span className="text-sm font-semibold tracking-tight">ShieldPath</span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Conta">
        {user ? (
          <>
            <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            <Link
              href="/inicio"
              className="inline-flex h-10 items-center rounded-full px-3 text-sm text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Início
            </Link>
            <Link
              href="/squad"
              className="inline-flex h-10 items-center rounded-full px-3 text-sm text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Time
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-full border border-white/15 px-3 text-sm text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
              >
                Sair
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/entrar"
              className="inline-flex h-10 items-center rounded-full px-3 text-sm text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Entrar
            </Link>
            <Link
              href="/criar-conta"
              className="inline-flex h-10 items-center rounded-full border border-white/15 px-3 text-sm text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
    </>
  );
}
