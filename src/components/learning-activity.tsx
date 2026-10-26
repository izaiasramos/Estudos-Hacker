"use client";

import { useState } from "react";
import type { Question } from "@/content/sql-injection";

type OrderQuestion = Extract<Question, { kind: "order" }>;

export function OrderActivity({ question, feedback }: { question: OrderQuestion; feedback?: string }) {
  const [items, setItems] = useState(question.items);
  const [moves, setMoves] = useState(0);

  function move(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
    setMoves((value) => value + 1);
  }

  return (
    <fieldset className="learning-activity rounded-[20px] border border-info/30 bg-info/[0.06] p-4 sm:p-5">
      <legend className="px-2 text-base font-semibold leading-6">{question.prompt}</legend>
      <div className="mt-2 flex items-center justify-between gap-3 text-sm text-muted">
        <p>Organize do primeiro ao último passo.</p>
        <span aria-live="polite" className="shrink-0 rounded-full bg-info/10 px-3 py-1 text-info">{moves === 0 ? "Sua vez" : `${moves} ${moves === 1 ? "movimento" : "movimentos"}`}</span>
      </div>
      <input type="hidden" name={question.id} value={items.map((item) => item.id).join(",")} />
      <ol className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={item.id} className="activity-item flex min-w-0 items-center gap-3 rounded-2xl border border-line-strong bg-ink/80 p-3">
            <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-info/10 font-mono text-sm font-bold text-info">{index + 1}</span>
            <span className="min-w-0 flex-1 text-base leading-6 text-text">{item.label}</span>
            <span className="flex shrink-0 gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover ${item.label} para cima`} className="grid size-10 place-items-center rounded-xl border border-line-strong text-lg text-text transition hover:border-info hover:bg-info/10 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Mover ${item.label} para baixo`} className="grid size-10 place-items-center rounded-xl border border-line-strong text-lg text-text transition hover:border-info hover:bg-info/10 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">↓</button>
            </span>
          </li>
        ))}
      </ol>
      {feedback ? <p role="alert" className="mt-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm leading-6 text-danger">{feedback}</p> : null}
    </fieldset>
  );
}
