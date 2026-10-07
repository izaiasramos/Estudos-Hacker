import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>ShieldPath · estudo em laboratório próprio</p>
      <nav className="flex gap-5" aria-label="Rodapé">
        <Link
          href="/#contrato"
          className="rounded-sm hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Termo
        </Link>
        <Link
          href="/#regras"
          className="rounded-sm hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Ética
        </Link>
      </nav>
    </footer>
  );
}
