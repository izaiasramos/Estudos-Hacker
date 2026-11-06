"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emitAudioOutcome } from "@/lib/audio-events";
import { VULNERABLE_QUERIES, type LabTest } from "@/lib/lab-check";

const DRAFT_KEY = "shieldpath:sql-defense-draft";

export function DefenseEditor({ done }: { done: boolean }) {
  const router = useRouter();
  const [source, setSource] = useState(() => {
    if (typeof window === "undefined") return VULNERABLE_QUERIES;
    return window.localStorage.getItem(DRAFT_KEY) ?? VULNERABLE_QUERIES;
  });
  const [tests, setTests] = useState<LabTest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [passed, setPassed] = useState(done);
  const [draftChecks, setDraftChecks] = useState<LabTest[] | null>(null);

  function inspectDraft() {
    const noConcat = !(/\+\s*email\b|\bemail\s*\+|\$\{\s*email\s*\}/.test(source));
    const placeholders = (source.match(/WHERE\s+email\s*=\s*\?/gi) ?? []).length;
    const valueLists = (source.match(/,\s*\[\s*email\s*\]\s*\)/g) ?? []).length;
    setDraftChecks([
      { id: "draft-concat", name: "Remover a concatenação nas duas funções", state: noConcat ? "pass" : "fail", detail: noConcat ? "Não encontramos email colado com + ou interpolação." : "Ainda existe email participando da construção da string SQL." },
      { id: "draft-slots", name: "Criar uma vaga ? em cada consulta", state: placeholders >= 2 ? "pass" : "fail", detail: `${Math.min(placeholders, 2)} de 2 consultas têm WHERE email = ?.` },
      { id: "draft-values", name: "Enviar [email] como segundo argumento", state: valueLists >= 2 ? "pass" : "fail", detail: `${Math.min(valueLists, 2)} de 2 chamadas enviam a lista [email].` },
    ]);
  }

  function updateSource(value: string) {
    setSource(value);
    setDraftChecks(null);
    window.localStorage.setItem(DRAFT_KEY, value);
  }

  if (done) {
    return (
      <p className="mt-8 text-sm text-defense" role="status">
        Correção aprovada: a estrutura parametrizada passou pela inspeção e pela suíte comportamental simulada. O mesmo payload não altera mais a consulta.
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
      emitAudioOutcome({
        outcome: data.passed ? "success" : "error",
        id: `sql-defense:${Date.now()}`,
      });
      if (data.passed) window.localStorage.removeItem(DRAFT_KEY);
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
      <div>
        <label htmlFor="source" className="text-sm font-medium">
          consultas.js
        </label>
        <p className="mt-1 text-xs text-muted">Seu rascunho fica salvo neste navegador enquanto você pratica.</p>
      </div>
      <section className="rounded-[18px] border border-defense/25 bg-defense/5 p-4">
        <h3 className="text-base font-semibold text-defense">Seu roteiro de correção</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Encontre <code>+ email +</code> nas duas funções.</li>
          <li>Troque o valor concatenado por uma vaga <code>?</code>.</li>
          <li>Passe <code>[email]</code> como segundo argumento de <code>db.query</code>.</li>
          <li>Preserve a busca normal e bloqueie o mesmo payload usado no ataque.</li>
        </ol>
        <p className="mt-3 text-xs text-muted">Você pode conferir o rascunho quantas vezes quiser. Isso não registra tentativa nem conclui o laboratório.</p>
      </section>
      <textarea
        id="source"
        name="source"
        value={source}
        onChange={(event) => updateSource(event.target.value)}
        spellCheck={false}
        rows={12}
        className="w-full rounded-[16px] border border-white/10 bg-ink p-4 font-mono text-[13px] leading-6 text-text outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={inspectDraft} className="inline-flex h-12 items-center rounded-full border border-defense/40 px-5 text-sm font-semibold text-defense">
          Conferir rascunho
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {pending ? "Rodando verificações" : "Corrigir e testar"}
        </button>
      </div>
      {draftChecks ? (
        <ol className="space-y-2" aria-live="polite">
          {draftChecks.map((check) => (
            <li key={check.id} className={`rounded-[16px] border px-4 py-3 ${check.state === "pass" ? "border-defense/30 bg-defense/5" : "border-danger/30 bg-danger/5"}`}>
              <p className={`text-sm font-semibold ${check.state === "pass" ? "text-defense" : "text-danger"}`}>{check.state === "pass" ? "Pronto" : "Falta"} · {check.name}</p>
              <p className="mt-1 text-sm text-muted">{check.detail}</p>
            </li>
          ))}
        </ol>
      ) : null}
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
                  ? "Passou"
                  : test.state === "fail"
                    ? "A corrigir"
                    : "Aguardando"}
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
          Correção aprovada. A estrutura foi reconhecida e a simulação confirmou que o fluxo normal continua funcionando e que o payload do ataque não amplia mais a consulta.
        </p>
      ) : null}
    </form>
  );
}
