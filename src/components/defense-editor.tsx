"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VULNERABLE_QUERIES, type LabTest } from "@/lib/lab-check";

export function DefenseEditor({ done }: { done: boolean }) {
  const router = useRouter();
  const [source, setSource] = useState(VULNERABLE_QUERIES);
  const [tests, setTests] = useState<LabTest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [passed, setPassed] = useState(done);

  if (done) {
    return (
      <p className="mt-8 text-sm text-defense" role="status">
        Inspeção estrutural aprovada: as duas funções mantêm o email fora do texto SQL. Este
        exercício não executou o código nem testou o banco.
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setTests(null);
    setError(null);
    setPassed(false);

    const body = new FormData();
    body.set("source", source);

    try {
      const response = await fetch("/api/trilha/lab", { method: "POST", body });
      if (!response.ok) {
        setError(
          "A inspeção não pôde ser concluída. Isso é uma falha de comunicação com o lab, não uma avaliação do seu código. Tente novamente.",
        );
        return;
      }

      const data = (await response.json()) as {
        passed: boolean;
        tests: LabTest[];
        sealed: boolean;
      };
      setTests(data.tests);
      setPassed(data.passed);
      if (data.sealed) {
        router.push("/trilha/sql-injection/selo");
        return;
      }
      if (data.passed) router.refresh();
    } catch {
      setError(
        "Não foi possível alcançar o serviço de inspeção. Nenhum resultado de execução foi produzido; verifique a conexão e tente novamente.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label htmlFor="source" className="text-sm font-medium">
        consultas.js
      </label>
      <textarea
        id="source"
        name="source"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
        rows={12}
        className="w-full rounded-[16px] border border-white/10 bg-ink p-4 font-mono text-[13px] leading-6 text-text outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Inspecionando estrutura" : "Inspecionar estrutura"}
      </button>
      {error ? (
        <p className="text-sm leading-relaxed text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {tests ? (
        <ol className="space-y-2" aria-live="polite">
          {tests.map((test, index) => (
            <li
              key={test.id}
              className="rise rounded-[16px] border border-white/10 bg-ink/60 px-4 py-3"
              style={{ animationDelay: `${index * 180}ms` }}
            >
              <p className="text-sm text-text">
                {test.state === "pass"
                  ? "Reconhecido"
                  : test.state === "fail"
                    ? "A corrigir"
                    : "Não executado"}
                <span className="mx-2 text-white/20">·</span>
                {test.name}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{test.detail}</p>
            </li>
          ))}
        </ol>
      ) : null}
      {passed ? (
        <p className="text-sm text-defense" role="status">
          Inspeção estrutural aprovada. Isso conclui o exercício, mas não representa uma execução
          do JavaScript nem um teste comportamental do banco.
        </p>
      ) : null}
    </form>
  );
}
