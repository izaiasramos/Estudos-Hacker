"use client";

import { motion, useReducedMotionConfig } from "motion/react";

const PATH =
  "M 18 16 C 40 14, 58 20, 74 28 C 96 39, 46 44, 28 58 C 12 71, 46 76, 72 84";

const NODES = [
  {
    id: "etica",
    label: "Ética",
    status: "agora",
    state: "now" as const,
    x: 18,
    y: 16,
    flip: false,
  },
  {
    id: "sqli",
    label: "SQL Injection",
    status: "bloqueada",
    state: "locked" as const,
    x: 74,
    y: 28,
    flip: true,
  },
  {
    id: "defesa",
    label: "Defesa",
    status: "bloqueada",
    state: "locked" as const,
    x: 28,
    y: 58,
    flip: false,
  },
  {
    id: "selo",
    label: "Selo",
    status: "bloqueada",
    state: "goal" as const,
    x: 72,
    y: 84,
    flip: true,
  },
];

export function TrailMap() {
  // Respeita o MotionConfig do layout (preferência do perfil) e o prefers-reduced-motion do sistema.
  const reduce = useReducedMotionConfig();
  const still = reduce === true;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="trail-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d6ff4a" />
            <stop offset="100%" stopColor="#3ee0b0" />
          </linearGradient>
          <filter id="trail-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d={PATH}
          fill="none"
          stroke="rgba(244,241,234,0.16)"
          strokeWidth="0.7"
          strokeLinecap="round"
          initial={{ pathLength: still ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: still ? 0 : 1.05, ease: "easeInOut" }}
        />
        <motion.path
          d={PATH}
          fill="none"
          stroke="url(#trail-stroke)"
          strokeWidth="0.9"
          strokeLinecap="round"
          filter="url(#trail-glow)"
          initial={{ pathLength: still ? 1 : 0, opacity: still ? 0.95 : 0.2 }}
          animate={{ pathLength: 1, opacity: 0.95 }}
          transition={{ duration: still ? 0 : 1.05, ease: "easeInOut" }}
        />
      </svg>

      <ol className="absolute inset-0">
        {NODES.map((node) => (
          <li
            key={node.id}
            className="absolute"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <NodeMark
                state={node.state}
                label={node.label}
                status={node.status}
                flip={node.flip}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NodeMark({
  state,
  label,
  status,
  flip,
}: {
  state: "now" | "locked" | "goal";
  label: string;
  status: string;
  flip: boolean;
}) {
  const ring =
    state === "now"
      ? "border-accent bg-accent text-ink shadow-[0_0_24px_rgba(214,255,74,0.45)]"
      : state === "goal"
        ? "border-defense/70 bg-ink text-defense"
        : "border-white/15 bg-surface text-muted";

  return (
    <div className={`flex items-center gap-3 ${flip ? "flex-row-reverse text-right" : ""}`}>
      <span className="relative grid size-11 shrink-0 place-items-center">
        {state === "now" ? (
          <span
            aria-hidden
            className="pulse-ring absolute inset-0 rounded-full border border-accent"
          />
        ) : null}
        <span
          className={`relative grid size-11 place-items-center rounded-full border ${state === "goal" ? "border-dashed" : ""} ${ring}`}
        >
          {state === "now" ? (
            <span className="size-2 rounded-full bg-ink" />
          ) : (
            <LockIcon />
          )}
        </span>
      </span>
      <span className="min-w-0 rounded-2xl border border-white/10 bg-ink/80 px-3 py-1.5 backdrop-blur-md">
        <span className="block whitespace-nowrap text-sm font-medium tracking-tight text-text">
          {label}
        </span>
        <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {status}
        </span>
      </span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 6V4.4a2.5 2.5 0 0 1 5 0V6" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
