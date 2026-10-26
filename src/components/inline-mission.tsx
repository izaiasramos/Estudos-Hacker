"use client";

import { useState } from "react";

type MissionId = "sql-papeis" | "sql-camadas" | "xss-caca-codigo" | "upload-pipeline";
type Result = "idle" | "success" | "retry";

const shell = "inline-mission my-8 overflow-hidden rounded-[22px] border border-info/35 bg-[linear-gradient(145deg,rgba(114,183,255,0.09),rgba(8,10,16,0.78))]";
const button = "inline-flex min-h-11 items-center justify-center rounded-full bg-info px-5 text-sm font-bold text-ink transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

export function InlineMission({ id }: { id: MissionId }) {
  if (id === "sql-papeis") return <ClassifyMission />;
  if (id === "sql-camadas") return <MatchMission />;
  if (id === "xss-caca-codigo") return <SpotMission />;
  return <BuildMission />;
}

function MissionHeader({ type, title, children }: { type: string; title: string; children: React.ReactNode }) {
  return (
    <header className="border-b border-info/20 px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-info/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-info">Missão durante a leitura</span>
        <span className="text-sm font-semibold text-muted">{type}</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{children}</p>
    </header>
  );
}

function Feedback({ result, success, retry }: { result: Result; success: string; retry: string }) {
  if (result === "idle") return null;
  const ok = result === "success";
  return (
    <div aria-live="polite" role={ok ? "status" : "alert"} className={`mission-feedback mt-4 rounded-2xl border p-4 text-sm leading-6 ${ok ? "border-defense/35 bg-defense/10 text-defense" : "border-danger/35 bg-danger/10 text-danger"}`}>
      <strong>{ok ? "✓ Missão concluída. " : "↻ Ainda não. "}</strong>{ok ? success : retry}
    </div>
  );
}

function ClassifyMission() {
  const items = [
    { id: "select", label: "SELECT id FROM pedidos WHERE email = ?", answer: "instruction" },
    { id: "email", label: "alice@exemplo.test", answer: "value" },
    { id: "table", label: "A tabela pedidos", answer: "instruction" },
  ];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>("idle");
  const check = () => setResult(items.every((item) => answers[item.id] === item.answer) ? "success" : "retry");
  return (
    <section className={shell} aria-label="Missão de classificação">
      <MissionHeader type="Classificar" title="Separe instrução de valor">Decida qual papel cada parte ocupa na consulta. Não vale deixar o dado vestir o uniforme de comando.</MissionHeader>
      <div className="p-5 sm:p-6">
        <div className="space-y-3">
          {items.map((item) => (
            <fieldset key={item.id} className="rounded-2xl border border-line bg-ink/70 p-4">
              <legend className="px-1 text-base font-medium text-text">{item.label}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {[{ id: "instruction", label: "Instrução" }, { id: "value", label: "Valor externo" }].map((option) => (
                  <label key={option.id} className="cursor-pointer rounded-full border border-line-strong px-4 py-2 text-sm text-text transition has-[:checked]:border-info has-[:checked]:bg-info/15">
                    <input className="sr-only" type="radio" name={`classify-${item.id}`} value={option.id} onChange={() => { setAnswers((current) => ({ ...current, [item.id]: option.id })); setResult("idle"); }} />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button type="button" className={`${button} mt-5`} onClick={check}>Conferir classificação</button>
        <Feedback result={result} success="A estrutura define a operação; o email viaja separado como valor." retry="Revise quem define a operação e quem veio de fora. A tabela e o SELECT fazem parte da instrução." />
      </div>
    </section>
  );
}

function MatchMission() {
  const pairs = [
    { id: "cause", risk: "Valor muda a estrutura SQL", answer: "params" },
    { id: "impact", risk: "Conta do banco acessa dados demais", answer: "privilege" },
    { id: "observe", risk: "Tentativas suspeitas passam sem alerta", answer: "monitor" },
  ];
  const options = [
    { id: "", label: "Escolha uma defesa" },
    { id: "params", label: "Consultas parametrizadas" },
    { id: "privilege", label: "Menor privilégio" },
    { id: "monitor", label: "Monitoramento" },
  ];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>("idle");
  return (
    <section className={shell} aria-label="Missão de associação">
      <MissionHeader type="Associar" title="Conecte cada risco à defesa certa">Defesas têm funções diferentes. Ligue cada problema à camada que age diretamente sobre ele.</MissionHeader>
      <div className="space-y-3 p-5 sm:p-6">
        {pairs.map((pair) => (
          <label key={pair.id} className="grid gap-3 rounded-2xl border border-line bg-ink/70 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span className="text-base text-text">{pair.risk}</span><span aria-hidden className="hidden text-info sm:block">→</span>
            <select value={answers[pair.id] ?? ""} onChange={(event) => { setAnswers((current) => ({ ...current, [pair.id]: event.target.value })); setResult("idle"); }} className="min-h-11 min-w-0 rounded-xl border border-line-strong bg-surface px-3 text-base text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">
              {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        ))}
        <button type="button" className={`${button} mt-2`} onClick={() => setResult(pairs.every((pair) => answers[pair.id] === pair.answer) ? "success" : "retry")}>Testar conexões</button>
        <Feedback result={result} success="Você tratou causa, impacto e observação com camadas diferentes." retry="Parametrização corrige a estrutura; privilégio limita alcance; monitoramento torna tentativas visíveis." />
      </div>
    </section>
  );
}

function SpotMission() {
  const lines = [
    { id: "read", code: "const comment = await request.text()" },
    { id: "sink", code: "panel.innerHTML = comment" },
    { id: "log", code: "logger.info('comentário recebido')" },
    { id: "safe", code: "panel.textContent = comment" },
  ];
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<Result>("idle");
  return (
    <section className={shell} aria-label="Investigação de código">
      <MissionHeader type="Investigar" title="Encontre a linha onde o dado vira código">Selecione a linha vulnerável. Aqui você está procurando o ponto de interpretação, não apenas onde o dado entrou.</MissionHeader>
      <div className="p-5 sm:p-6">
        <div className="overflow-hidden rounded-2xl border border-line-strong bg-[#05070b] font-mono text-sm">
          {lines.map((line, index) => {
            const active = selected.includes(line.id);
            return <button key={line.id} type="button" aria-pressed={active} onClick={() => { setSelected((current) => current.includes(line.id) ? current.filter((id) => id !== line.id) : [...current, line.id]); setResult("idle"); }} className={`grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-3 py-3 text-left last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info ${active ? "bg-info/15 text-info" : "text-text hover:bg-white/[0.04]"}`}><span aria-hidden className="text-right text-muted">{index + 1}</span><code className="min-w-0 whitespace-pre-wrap break-words">{line.code}</code></button>;
          })}
        </div>
        <button type="button" className={`${button} mt-5`} onClick={() => setResult(selected.length === 1 && selected[0] === "sink" ? "success" : "retry")}>Analisar seleção</button>
        <Feedback result={result} success="innerHTML interpreta o comentário como marcação ativa. textContent o mantém como texto." retry="Procure a operação que pede ao navegador para interpretar HTML, não a linha que apenas recebe ou registra o valor." />
      </div>
    </section>
  );
}

function BuildMission() {
  const initial = [
    { id: "publish", label: "Publicar em origem isolada" },
    { id: "receive", label: "Receber em área temporária" },
    { id: "name", label: "Gerar um novo nome" },
    { id: "validate", label: "Validar e reprocessar" },
  ];
  const [items, setItems] = useState(initial);
  const [result, setResult] = useState<Result>("idle");
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next); setResult("idle");
  }
  return (
    <section className={shell} aria-label="Missão de montagem">
      <MissionHeader type="Montar" title="Construa o pipeline de upload seguro">Reorganize as etapas. Os botões funcionam com toque, mouse e teclado.</MissionHeader>
      <div className="p-5 sm:p-6">
        <ol className="space-y-2">
          {items.map((item, index) => <li key={item.id} className="activity-item flex items-center gap-3 rounded-2xl border border-line-strong bg-ink/75 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-info/15 font-mono font-bold text-info">{index + 1}</span><span className="min-w-0 flex-1 text-base text-text">{item.label}</span><span className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover ${item.label} para cima`} className="grid size-10 place-items-center rounded-xl border border-line-strong disabled:opacity-30">↑</button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Mover ${item.label} para baixo`} className="grid size-10 place-items-center rounded-xl border border-line-strong disabled:opacity-30">↓</button></span></li>)}
        </ol>
        <button type="button" className={`${button} mt-5`} onClick={() => setResult(items.map((item) => item.id).join(",") === "receive,validate,name,publish" ? "success" : "retry")}>Executar pipeline</button>
        <Feedback result={result} success="O arquivo só recebe nome definitivo e publicação depois de ser validado e reprocessado." retry="Evite publicar ou dar destino definitivo antes de conferir o conteúdo." />
      </div>
    </section>
  );
}
