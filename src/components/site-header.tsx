import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { activeLab, minutesLeft } from "@/lib/lab-runtime";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const lab = user ? await activeLab(user.id) : null;

  return (
    <>
    {lab ? (
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-accent px-5 py-2 text-base font-semibold text-ink sm:px-8">
        <p>Ambiente ativo · {minutesLeft(lab)} min</p>
        <form action="/api/lab/session/stop" method="post">
          <button type="submit" className="rounded-full bg-ink px-3 py-1 text-xs text-text">
            Encerrar
          </button>
        </form>
      </div>
    ) : null}
    <header className="relative z-20 mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:flex-nowrap sm:px-8 sm:py-6">
      <Link
        href={user ? "/inicio" : "/"}
        aria-label="DefendaDev"
        className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <Image src="/logo-icone.png" alt="" width={40} height={40} priority className="size-10" />
        <span className="sr-only text-lg font-semibold tracking-tight min-[480px]:not-sr-only">
          Defenda<span className="text-info">Dev</span>
        </span>
      </Link>
      <nav className="flex min-w-0 flex-wrap items-center justify-end gap-0.5 sm:gap-2" aria-label="Conta">
        {user ? (
          <>
            <Link
              href="/perfil"
              className="inline-flex h-11 items-center rounded-full px-2.5 text-sm sm:text-base text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              <UserAvatar userId={user.id} name={user.name} hasAvatar={Boolean(user.avatar)} className="mr-2 size-8 text-sm" />
              <span className="sr-only sm:not-sr-only sm:max-w-[10rem] sm:truncate">{user.name}</span>
            </Link>
            <Link
              href="/inicio"
              className="inline-flex h-11 items-center rounded-full px-2.5 text-sm sm:text-base text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Início
            </Link>
            <Link
              href="/squad"
              className="inline-flex h-11 items-center rounded-full px-2.5 text-sm sm:text-base text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Time
            </Link>
            {/* Só atalho visual. Quem protege /admin é a checagem no servidor da própria página. */}
            {isAdmin(user) ? (
              <Link
                href="/admin"
                className="inline-flex h-11 items-center rounded-full px-2.5 text-sm sm:text-base text-accent transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
              >
                Admin
              </Link>
            ) : null}
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-2.5 text-sm sm:text-base text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
              >
                Sair
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/entrar"
              className="inline-flex h-11 items-center rounded-full px-2.5 text-sm sm:text-base text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
            >
              Entrar
            </Link>
            <Link
              href="/criar-conta"
              className="inline-flex h-11 items-center rounded-full border border-white/15 px-2.5 text-sm sm:text-base text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-4"
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
