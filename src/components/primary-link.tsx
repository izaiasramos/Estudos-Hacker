"use client";

import Link from "next/link";
import { useRef } from "react";

type PrimaryLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function PrimaryLink({ href, children }: PrimaryLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onPointerMove}
      className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-6 text-sm font-semibold text-ink shadow-[0_0_36px_rgba(214,255,74,0.32)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(90px circle at var(--x, 70%) var(--y, 50%), rgba(255,255,255,0.55), transparent 62%)",
        }}
      />
      <span className="relative">{children}</span>
      <span
        aria-hidden
        className="relative transition-transform duration-200 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
