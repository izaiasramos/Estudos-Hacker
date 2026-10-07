import Link from "next/link";
import { UNITS, type Unit } from "@/content/sql-injection";
import type { ProgressRow } from "@/lib/trail-progress";
import { unitStatus } from "@/lib/trail-progress";

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
  return (
    <nav aria-label="Unidades da trilha" className="flex gap-2 lg:flex-col">
      <RailItem
        href="/regras"
        label="Ética"
        status={ethicsDone ? "concluída" : "agora"}
        current={false}
      />
      {units.map((unit) => {
        const status = unitStatus(unit, progress, ethicsDone);
        const open = status === "concluída" || status === "agora";
        return (
          <RailItem
            key={unit.id}
            href={open ? `${basePath}/${unit.id}` : undefined}
            label={unit.title}
            status={status}
            current={unit.id === currentId}
          />
        );
      })}
    </nav>
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
  status: string;
  current: boolean;
}) {
  const className = `min-w-[180px] rounded-[16px] border px-3 py-2 text-left lg:min-w-0 ${
    current ? "border-accent/60 bg-surface" : "border-white/10 bg-surface/40"
  }`;
  const body = (
    <>
      <span className="block truncate text-sm text-text">{label}</span>
      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {status}
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
