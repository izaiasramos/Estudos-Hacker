import { Fragment } from "react";
import Link from "next/link";
import { UNITS, type Unit } from "@/content/sql-injection";
import type { ProgressRow } from "@/lib/trail-progress";
import { unitStatus } from "@/lib/trail-progress";

type Status = "concluída" | "agora" | "bloqueada";

/**
 * Mapa de nós da trilha (seção 15.6). Movimento explica estado (15.1):
 * - concluída: nó aceso e parado; a aresta até ele fica acesa;
 * - agora: nó com anel pulsando e a luz correndo pela aresta que chega nele, uma vez;
 * - bloqueada: nó opaco, aresta apagada.
 * O estado também vem escrito, então não depende só da cor nem do movimento.
 */
export function UnitRail({
  currentId,
  progress,
  ethicsDone,
  units = UNITS,
  basePath = "/trilha/sql-injection",
}: {
  currentId?: string;
  progress: Map<string, ProgressRow>;
  ethicsDone: boolean;
  units?: Unit[];
  basePath?: string;
}) {
  const items = [
    { key: "etica", href: "/regras", label: "Ética", status: (ethicsDone ? "concluída" : "agora") as Status, current: false },
    ...units.map((unit) => {
      const status = unitStatus(unit, progress, ethicsDone) as Status;
      const open = status === "concluída" || status === "agora";
      return {
        key: unit.id,
        href: open ? `${basePath}/${unit.id}` : undefined,
        label: unit.title,
        status,
        current: unit.id === currentId,
      };
    }),
  ];

  return (
    <nav aria-label="Unidades da trilha" className="flex items-stretch lg:flex-col">
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 ? <RailEdge to={item.status} /> : null}
          <RailItem {...item} />
        </Fragment>
      ))}
    </nav>
  );
}

function RailEdge({ to }: { to: Status }) {
  const state = to === "concluída" ? "lit" : to === "agora" ? "trace" : "off";
  return (
    <span
      aria-hidden
      data-state={state}
      className="rail-edge shrink-0 self-center lg:ml-[calc(1.25rem-1px)] lg:self-start"
    />
  );
}

function RailItem({
  href,
  label,
  status,
  current,
}: {
  href?: string;
  label: string;
  status: Status;
  current: boolean;
}) {
  const className = `flex min-w-[180px] items-center gap-3 rounded-[16px] border px-3 py-2 text-left lg:min-w-0 ${
    current ? "border-accent/60 bg-surface" : "border-white/10 bg-surface/40"
  }`;
  const body = (
    <>
      <NodeDot status={status} />
      <span className="min-w-0">
        <span className="block truncate text-sm text-text">{label}</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {status}
        </span>
      </span>
    </>
  );
  if (!href) {
    return <span className={`${className} opacity-70`}>{body}</span>;
  }
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
    >
      {body}
    </Link>
  );
}

function NodeDot({ status }: { status: Status }) {
  if (status === "concluída") {
    return (
      <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full bg-defense text-ink">
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M1.5 4.2 3.2 5.8 6.5 2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    );
  }
  if (status === "agora") {
    return (
      <span aria-hidden className="relative grid size-4 shrink-0 place-items-center">
        <span className="pulse-ring absolute inset-0 rounded-full border border-accent" />
        <span className="size-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(214,255,74,0.6)]" />
      </span>
    );
  }
  return <span aria-hidden className="size-4 shrink-0 rounded-full border border-white/20" />;
}
