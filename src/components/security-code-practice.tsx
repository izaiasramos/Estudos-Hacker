"use client";

import { useState } from "react";
import { DarkPlusCode, DarkPlusCodeEditor, DarkPlusLine } from "@/components/dark-plus-code";
import { emitAudioOutcome } from "@/lib/audio-events";
import { inspectCode, SECURITY_CODE_PRACTICES, type CodeLevelKind, type RuleResult, type SecurityTopic } from "@/lib/security-code-practice";

type SavedState = { active: number; drafts: string[]; completed: CodeLevelKind[] };
const LEVEL_LABELS = ["Uma peça", "Acumular", "Função completa", "Explicar"];

export function SecurityCodePractice({ topic }: { topic: SecurityTopic }) {
  const practice = SECURITY_CODE_PRACTICES[topic];
  const storageKey = `shieldpath:security-code-practice:v2:${topic}`;
  const initial = readSaved(storageKey, practice.levels.map((level) => level.starter));
  const [active, setActive] = useState(initial.active);
  const [drafts, setDrafts] = useState(initial.drafts);
  const [completed, setCompleted] = useState<CodeLevelKind[]>(initial.completed);
  const [results, setResults] = useState<RuleResult[] | null>(null);
  const [selectedLine, setSelectedLine] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const level = practice.levels[active];
  const source = drafts[active];
  const passed = results !== null && results.every((result) => result.ok);

  function persist(next: SavedState) { try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch {} }
  function updateSource(value: string) { const nextDrafts = drafts.map((draft, index) => index === active ? value.slice(0, 12000) : draft); setDrafts(nextDrafts); setResults(null); persist({ active, drafts: nextDrafts, completed }); }
  function inspect() { const nextResults = inspectCode(source, level); const ok = nextResults.every((result) => result.ok); const nextCompleted = ok && !completed.includes(level.id) ? [...completed, level.id] : completed; setResults(nextResults); setCompleted(nextCompleted); persist({ active, drafts, completed: nextCompleted }); emitAudioOutcome({ outcome: ok ? "success" : "error", id: `code-practice:${topic}:${level.id}:${Date.now()}` }); }
  function goTo(index: number) { if (index > 0 && !completed.includes(practice.levels[index - 1].id)) return; setActive(index); setResults(null); setSelectedLine(0); setHintCount(0); setSolutionVisible(false); persist({ active: index, drafts, completed }); }
  function nextLevel() { if (active >= practice.levels.length - 1) return; const next = active + 1; const nextDrafts = [...drafts]; if (nextDrafts[next] === practice.levels[next].starter) nextDrafts[next] = next === 2 ? practice.levels[next].starter : source; setDrafts(nextDrafts); setActive(next); setResults(null); setSelectedLine(0); setHintCount(0); setSolutionVisible(false); persist({ active: next, drafts: nextDrafts, completed }); }
  function resetLevel() { const nextDrafts = drafts.map((draft, index) => index === active ? level.starter : draft); const nextCompleted = completed.filter((id) => id !== level.id); setDrafts(nextDrafts); setCompleted(nextCompleted); setResults(null); setHintCount(0); setSolutionVisible(false); persist({ active, drafts: nextDrafts, completed: nextCompleted }); }

  return <section className="my-8 overflow-hidden rounded-[24px] border border-accent/35 bg-[linear-gradient(145deg,rgba(214,255,74,0.07),rgba(8,10,16,0.94))]" aria-labelledby={`code-practice-${topic}`}>
    <header className="border-b border-accent/20 p-5 sm:px-6"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">Oficina de código</span><span className="text-sm text-muted">4 níveis cumulativos · prática complementar</span></div><h3 id={`code-practice-${topic}`} className="mt-3 text-2xl font-semibold text-text">{practice.title}</h3><p className="mt-2 max-w-[74ch] text-sm leading-6 text-muted">{practice.summary} Primeiro você entende as peças. Depois escreve uma por vez.</p></header>
    <nav className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4" aria-label="Níveis da oficina">{practice.levels.map((item, index) => { const unlocked = index === 0 || completed.includes(practice.levels[index - 1].id); const done = completed.includes(item.id); return <button key={item.id} type="button" disabled={!unlocked} onClick={() => goTo(index)} aria-current={active === index ? "step" : undefined} className={`min-h-14 border-r border-white/10 px-2 text-xs font-semibold sm:text-sm ${active === index ? "bg-accent text-ink" : done ? "bg-defense/10 text-defense" : unlocked ? "text-text" : "text-muted opacity-45"}`}>{done ? "✓ " : `${index + 1}. `}{LEVEL_LABELS[index]}</button>; })}</nav>
    <div className="p-5 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{level.title}</p>
      <h4 className="mt-3 text-lg font-semibold text-text">1. Entenda o que já existe</h4>
      <p className="mt-2 text-sm leading-6 text-muted">{level.context}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{practice.anatomy.map((part) => <div key={part.name} className="rounded-xl border border-info/20 bg-info/5 p-3"><code className="text-sm font-bold text-info">{part.name}</code><p className="mt-1 text-sm leading-6 text-muted">{part.role}</p></div>)}</div>
      <div className="mt-3 rounded-xl border border-white/10 bg-[#1e1e1e] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#9cdcfe]">Exemplo de chamada</p><DarkPlusCode code={practice.exampleCall} /></div>

      <h4 className="mt-6 text-lg font-semibold text-text">2. Saiba exatamente o que fazer</h4>
      <div className="mt-3 rounded-xl border border-info/25 bg-info/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-info">Objetivo desta etapa</p><p className="mt-2 text-sm font-semibold text-text">{level.task}</p><ol className="mt-3 space-y-2 text-sm leading-6 text-muted">{level.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="mt-3 text-sm text-defense"><strong>Resultado esperado:</strong> as estruturas listadas acima aparecem dentro da função e o comportamento vulnerável deixa de ser usado.</p></div>

      <h4 className="mt-6 text-lg font-semibold text-text">3. Edite no ponto marcado</h4>
      <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <DarkPlusCodeEditor id={`editor-${topic}-${level.id}`} fileName="solucao.js" value={source} onChange={updateSource} />
        <aside className="rounded-[16px] border border-[#3c3c3c] bg-[#1e1e1e] p-4"><p className="font-mono text-xs uppercase tracking-wide text-[#4ec9b0]">Como ler o código</p><p className="mt-2 text-sm leading-6 text-[#cccccc]">A linha com comentário verde marca onde você trabalha. Preserve a assinatura da função. Nomes entre parênteses são valores ou serviços que ela recebe.</p><div className="mt-4 border-t border-[#3c3c3c] pt-4"><p className="text-xs font-bold uppercase text-[#9cdcfe]">Referência visual</p><DarkPlusCode code={level.solution.split("\n").slice(0, Math.min(5, level.solution.split("\n").length)).join("\n")} /></div></aside>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">As cores imitam o tema Dark+ do VS Code. A plataforma apenas inspeciona estruturas conhecidas; não executa código, rede ou arquivos.</p>

      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={inspect} className="min-h-11 rounded-full bg-accent px-5 text-sm font-bold text-ink">Conferir esta etapa</button><button type="button" onClick={() => setHintCount((count) => Math.min(3, count + 1))} disabled={hintCount >= 3} className="min-h-11 rounded-full border border-info/35 px-4 text-sm font-semibold text-info disabled:opacity-45">{hintCount === 0 ? "Quero uma dica" : hintCount < 3 ? "Próxima dica" : "Todas as dicas abertas"}</button>{hintCount >= 3 ? <button type="button" onClick={() => setSolutionVisible(true)} className="min-h-11 rounded-full border border-defense/35 px-4 text-sm font-semibold text-defense">Ver resposta completa</button> : null}<button type="button" onClick={resetLevel} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-muted">Restaurar nível</button></div>
      {hintCount > 0 ? <div className="mt-4 space-y-2">{level.hints.slice(0, hintCount).map((hint, index) => <p key={hint} className="rounded-xl border border-info/20 bg-info/5 p-3 text-sm leading-6 text-muted"><strong className="text-info">Dica {index + 1}:</strong> {hint}</p>)}</div> : null}
      {solutionVisible ? <div className="mt-4 rounded-[16px] border border-defense/30 bg-[#1e1e1e] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-defense">Resposta explicada</p><button type="button" onClick={() => updateSource(level.solution)} className="rounded-full bg-defense px-4 py-2 text-xs font-bold text-ink">Levar resposta ao editor</button></div><DarkPlusCode code={level.solution} /></div> : null}
      {results ? <ul className="mt-5 space-y-2" aria-live="polite">{results.map((result) => <li key={result.label} className={`rounded-xl border p-3 ${result.ok ? "border-defense/30 bg-defense/5" : "border-danger/30 bg-danger/5"}`}><p className={`text-sm font-semibold ${result.ok ? "text-defense" : "text-danger"}`}>{result.ok ? "Encontrado" : "Ainda falta"} · {result.label}</p><p className="mt-1 text-sm leading-6 text-muted">{result.explanation}</p></li>)}</ul> : null}
      {passed ? <div className="mt-6 rounded-[18px] border border-defense/35 bg-defense/5 p-4"><h4 className="text-base font-semibold text-defense">Etapa reconhecida. Clique nas linhas para entender o motivo.</h4><div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]"><div className="overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#1e1e1e] font-mono text-sm">{level.lines.map((line) => <button key={`${line.line}:${line.code}`} type="button" aria-pressed={selectedLine === line.line - 1} aria-label={`Explicar linha ${line.line}: ${line.code.trim() || "linha em branco"}`} onClick={() => setSelectedLine(line.line - 1)} className={`grid w-full grid-cols-[2.5rem_1fr] gap-2 border-b border-[#2b2b2b] p-3 text-left last:border-0 ${selectedLine === line.line - 1 ? "bg-[#264f78]" : ""}`}><span className="text-right text-[#858585]">{line.line}</span><DarkPlusLine code={line.code} /></button>)}</div><div className="rounded-xl border border-info/25 bg-info/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-info">Por que esta linha existe?</p><p className="mt-2 text-sm leading-6 text-text">{level.lines[selectedLine]?.explanation}</p></div></div>{active === practice.levels.length - 1 ? <Retest tests={practice.tests} /> : <button type="button" onClick={nextLevel} className="mt-4 min-h-11 rounded-full bg-defense px-5 text-sm font-bold text-ink">Levar esta base para o próximo nível</button>}</div> : null}
    </div>
  </section>;
}

function Retest({ tests }: { tests: string[] }) { return <div className="mt-5"><p className="text-sm font-semibold text-text">Reteste comportamental simulado</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{tests.map((test) => <li key={test} className="rounded-xl border border-defense/25 bg-defense/5 p-3 text-sm text-defense">✓ {test}</li>)}</ul><p className="mt-3 text-xs leading-5 text-muted">A implementação controlada equivalente passou. Seu texto não foi executado.</p></div>; }
function readSaved(key: string, starters: string[]): SavedState { if (typeof window === "undefined") return { active: 0, drafts: starters, completed: [] }; try { const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as Partial<SavedState> | null; if (!parsed || !Array.isArray(parsed.drafts) || parsed.drafts.length !== starters.length || !Array.isArray(parsed.completed)) throw new Error("invalid"); return { active: Math.min(Math.max(Number(parsed.active) || 0, 0), starters.length - 1), drafts: parsed.drafts.map((draft, index) => typeof draft === "string" ? draft.slice(0, 12000) : starters[index]), completed: parsed.completed } as SavedState; } catch { return { active: 0, drafts: starters, completed: [] }; } }
