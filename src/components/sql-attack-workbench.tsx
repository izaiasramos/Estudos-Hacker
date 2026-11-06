"use client";

import { useState } from "react";
import { emitAudioOutcome } from "@/lib/audio-events";

const NORMAL_EMAIL = "alice@exemplo.test";
const QUOTE_EMAIL = "alice@exemplo.test'";
const FALSE_EMAIL = "alice@exemplo.test' OR '1'='2";
const TRUE_EMAIL = "alice@exemplo.test' OR '1'='1";
const STEPS = ["normal", "quote", "false", "true", "build", "defense"] as const;
type Step = (typeof STEPS)[number];

type Person = { name: string; email: string; item: string };
const PEOPLE: Person[] = [
  { name: "Alice", email: NORMAL_EMAIL, item: "Margherita" },
  { name: "Bruno", email: "bruno@exemplo.test", item: "Calabresa" },
];

const STEP_COPY: Record<Step, { kicker: string; title: string; instruction: string }> = {
  normal: { kicker: "1 · Linha de base", title: "Veja o filtro funcionando", instruction: "Execute o email normal. Antes do ataque, precisamos saber qual resultado é correto." },
  quote: { kicker: "2 · Quebrar a fronteira", title: "Descubra o papel da aspa", instruction: "Uma aspa fecha o valor antes da hora. A consulta fica inválida, mas revela onde entrada e instrução se misturam." },
  false: { kicker: "3 · Testar uma hipótese", title: "OR com uma condição falsa", instruction: "Compare 1 com 2. Como são diferentes, essa parte é falsa e não libera todas as linhas." },
  true: { kicker: "4 · Reproduzir o vazamento", title: "OR com uma condição sempre verdadeira", instruction: "Compare 1 com 1. A alternativa fica verdadeira para qualquer linha, inclusive a de Bruno." },
  build: { kicker: "5 · Montar sem copiar", title: "Reconstrua o payload", instruction: "Clique nos blocos na ordem que transforma o email em uma condição alternativa verdadeira." },
  defense: { kicker: "6 · Comparar a defesa", title: "Passe o mesmo texto como parâmetro", instruction: "Veja por que o payload deixa de ser código quando instrução e valor viajam separados." },
};

const BUILD_PARTS = [
  { id: "email", label: NORMAL_EMAIL },
  { id: "quote", label: "'" },
  { id: "or", label: "OR" },
  { id: "truth", label: "'1'='1" },
] as const;

export function SqlAttackWorkbench() {
  const [step, setStep] = useState<Step>("normal");
  const [ran, setRan] = useState(false);
  const [built, setBuilt] = useState<string[]>([]);
  const [buildResult, setBuildResult] = useState<"idle" | "retry" | "success">("idle");
  const [prediction, setPrediction] = useState("");
  const [predictionError, setPredictionError] = useState(false);

  const copy = STEP_COPY[step];
  const input = stepInput(step, built);
  const syntaxError = step === "quote";
  const injectedTruth = step === "true" || (step === "build" && buildResult === "success");
  const parameterized = step === "defense";
  const visible = parameterized ? [] : injectedTruth ? PEOPLE : PEOPLE.filter((person) => person.email === NORMAL_EMAIL);

  function selectStep(next: Step) {
    setStep(next);
    setRan(false);
    setBuildResult("idle");
    setPrediction("");
    setPredictionError(false);
  }

  function run() {
    if (step === "defense" && prediction !== "zero") {
      setPredictionError(true);
      emitAudioOutcome({ outcome: "error", id: `sql-prediction:${Date.now()}` });
      return;
    }
    setPredictionError(false);
    setRan(true);
    emitAudioOutcome({ outcome: "success", id: `sql-step:${step}:${Date.now()}` });
  }

  function addPart(id: string) {
    if (built.includes(id)) return;
    setBuilt((current) => [...current, id]);
    setBuildResult("idle");
    setRan(false);
  }

  function checkBuild() {
    const ok = built.join(",") === "email,quote,or,truth";
    setBuildResult(ok ? "success" : "retry");
    setRan(ok);
    emitAudioOutcome({ outcome: ok ? "success" : "error", id: `sql-build:${Date.now()}` });
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[24px] border border-danger/35 bg-[linear-gradient(145deg,rgba(255,92,57,0.08),rgba(8,10,16,0.94))]" aria-labelledby="sql-attack-title">
      <header className="border-b border-danger/20 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-danger/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-danger">Laboratório autorizado</span>
          <span className="text-sm text-muted">6 práticas curtas · dados fictícios</span>
        </div>
        <h2 id="sql-attack-title" className="mt-3 text-2xl font-semibold text-text">Entenda o ataque caractere por caractere</h2>
        <p className="mt-2 max-w-[76ch] text-sm leading-6 text-muted">Você não vai colar um payload sem saber o motivo. Cada etapa muda uma peça, mostra a consulta criada pelo servidor e avalia Alice e Bruno separadamente.</p>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-white/10 p-4" aria-label="Etapas do laboratório SQL">
        {STEPS.map((item, index) => (
          <button key={item} type="button" onClick={() => selectStep(item)} aria-current={step === item ? "step" : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${step === item ? "border-accent bg-accent text-ink" : "border-white/15 text-muted hover:text-text"}`}>
            {index + 1}. {shortLabel(item)}
          </button>
        ))}
      </nav>

      <div className="p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-danger">{copy.kicker}</p>
        <h3 className="mt-2 text-xl font-semibold text-text">{copy.title}</h3>
        <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted">{copy.instruction}</p>

        {step === "build" ? (
          <BuildPanel built={built} result={buildResult} onAdd={addPart} onReset={() => { setBuilt([]); setBuildResult("idle"); setRan(false); }} onCheck={checkBuild} />
        ) : (
          <div className="mt-5 rounded-[18px] border border-line bg-ink/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Entrada do formulário</p>
            <code className="mt-2 block break-words rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-info">{input}</code>
            {step === "defense" ? (
              <fieldset className="mt-4 rounded-xl border border-defense/25 bg-defense/5 p-3">
                <legend className="px-1 text-sm font-semibold text-text">Antes de testar, o que você prevê?</legend>
                <div className="mt-2 space-y-2 text-sm text-muted">
                  {[["alice", "Retorna somente Alice"], ["both", "Retorna Alice e Bruno"], ["zero", "Retorna zero pedidos: o payload inteiro vira um email literal"]].map(([value, label]) => (
                    <label key={value} className="flex cursor-pointer items-start gap-2"><input type="radio" name="defense-prediction" value={value} checked={prediction === value} onChange={() => { setPrediction(value); setPredictionError(false); setRan(false); }} className="mt-1 accent-[#4dffa4]" /><span>{label}</span></label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <button type="button" onClick={run} disabled={step === "defense" && !prediction} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-danger px-5 text-sm font-bold text-ink disabled:opacity-45">
              {step === "defense" ? "Conferir previsão e testar" : "Enviar ao servidor simulado"}
            </button>
            {predictionError ? <p className="mt-3 text-sm text-danger" role="alert">Ainda não. Lembre que o banco procura um email exatamente igual ao texto inteiro enviado como parâmetro.</p> : null}
          </div>
        )}

        {ran ? (
          <div className="mt-6 space-y-5" aria-live="polite">
            <QueryAssembly input={input} parameterized={parameterized} syntaxError={syntaxError} />
            {step === "false" || step === "true" ? <BooleanExplanation alwaysTrue={step === "true"} /> : null}
            {syntaxError ? (
              <Evidence tone="warning" title="A consulta quebrou, e isso é uma pista">A aspa enviada fechou o email. A aspa que o programa adiciona no final ficou sobrando. Um erro assim revela que a entrada alcançou a estrutura SQL.</Evidence>
            ) : parameterized ? (
              <DefenseComparison input={input} />
            ) : (
              <ResultTable people={PEOPLE} injectedTruth={injectedTruth} visible={visible} />
            )}
            <StepConclusion step={step} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BuildPanel({ built, result, onAdd, onReset, onCheck }: { built: string[]; result: "idle" | "retry" | "success"; onAdd: (id: string) => void; onReset: () => void; onCheck: () => void }) {
  const payload = built.map((id) => BUILD_PARTS.find((part) => part.id === id)?.label).filter(Boolean).join(" ");
  return (
    <div className="mt-5 rounded-[18px] border border-line bg-ink/70 p-4">
      <p className="text-sm font-semibold text-text">Clique na ordem: email → fechar valor → criar alternativa → tornar alternativa verdadeira.</p>
      <div className="mt-3 flex min-h-14 flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/25 p-3 font-mono text-sm text-info">
        {payload || <span className="font-sans text-muted">Seu payload aparecerá aqui.</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {BUILD_PARTS.map((part) => <button key={part.id} type="button" disabled={built.includes(part.id)} onClick={() => onAdd(part.id)} className="rounded-xl border border-white/15 px-3 py-2 font-mono text-sm text-text disabled:opacity-35">{part.label}</button>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onCheck} disabled={built.length !== BUILD_PARTS.length} className="inline-flex min-h-11 items-center rounded-full bg-danger px-5 text-sm font-bold text-ink disabled:opacity-45">Executar payload montado</button>
        <button type="button" onClick={onReset} className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm text-text">Limpar</button>
      </div>
      {result === "retry" ? <p className="mt-3 text-sm text-danger" role="alert">A ordem ainda não forma a sequência. A aspa precisa encerrar o email antes de OR apresentar a nova condição.</p> : null}
      {result === "success" ? <p className="mt-3 text-sm text-defense" role="status">Montagem correta. Agora o email terminou, e OR acrescentou uma condição verdadeira.</p> : null}
    </div>
  );
}

function QueryAssembly({ input, parameterized, syntaxError }: { input: string; parameterized: boolean; syntaxError: boolean }) {
  return (
    <section className="rounded-[18px] border border-line bg-[#05070b] p-4">
      <h4 className="text-base font-semibold text-text">1. O que o servidor entrega ao banco</h4>
      {parameterized ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-defense/30 bg-defense/5 p-3"><p className="text-xs font-bold uppercase text-defense">1º argumento de db.query · instrução fixa</p><code className="mt-2 block break-words text-sm text-text">SELECT email, item FROM pedidos WHERE email = ?</code><p className="mt-2 text-xs text-muted">O ? é a vaga. Ele não contém o email.</p></div>
          <div className="rounded-xl border border-info/30 bg-info/5 p-3"><p className="text-xs font-bold uppercase text-info">2º argumento · lista [email]</p><code className="mt-2 block break-words text-sm text-text">[{JSON.stringify(input)}]</code><p className="mt-2 text-xs text-muted">A variável email contém o payload inteiro como um único valor.</p></div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-black/35 p-3 font-mono text-sm leading-7">
            <span className="text-muted">SELECT email, item FROM pedidos WHERE email = &apos;</span>
            <span className="rounded bg-info/15 px-1 text-info">{input}</span>
            <span className="text-muted">&apos;</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/5 px-3 py-1 text-muted">cinza: texto escrito pelo programador</span>
            <span className="rounded-full bg-info/15 px-3 py-1 text-info">azul: texto vindo do formulário</span>
          </div>
          {syntaxError ? <p className="mt-3 text-sm text-danger">O banco tentaria interpretar aspas sem par. Resultado simulado: erro de sintaxe.</p> : null}
        </>
      )}
    </section>
  );
}

function BooleanExplanation({ alwaysTrue }: { alwaysTrue: boolean }) {
  return (
    <section className="rounded-[18px] border border-line bg-ink/65 p-4">
      <h4 className="text-base font-semibold text-text">2. Traduza a lógica para português</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        <LogicCard title="Condição original">email é da Alice?</LogicCard><span className="text-center font-bold text-danger">OR</span>
        <LogicCard title="Condição adicionada">1 é igual a {alwaysTrue ? "1" : "2"}? <strong className={alwaysTrue ? "text-danger" : "text-defense"}>{alwaysTrue ? "Sim" : "Não"}</strong></LogicCard><span className="text-center text-muted">=</span>
        <LogicCard title="Regra do OR">Basta um dos lados ser verdadeiro.</LogicCard>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{alwaysTrue ? "Como 1 sempre é igual a 1, o lado direito é verdadeiro em todas as linhas. O banco deixa de depender do email." : "Como 1 não é igual a 2, o lado direito é falso. O banco ainda depende do email corresponder."}</p>
    </section>
  );
}

function LogicCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="h-full rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted">{title}</p><p className="mt-2 text-sm text-text">{children}</p></div>;
}

function ResultTable({ people, injectedTruth, visible }: { people: Person[]; injectedTruth: boolean; visible: Person[] }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-line bg-ink/65">
      <div className="p-4"><h4 className="text-base font-semibold text-text">3. Avalie cada linha do banco</h4><p className="mt-1 text-sm text-muted">O banco repete a condição para cada pedido.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-y border-white/10 bg-white/[0.03] text-xs uppercase text-muted"><tr><th className="p-3">Pedido</th><th className="p-3">Email = Alice</th><th className="p-3">Condição após OR</th><th className="p-3">Linha incluída?</th></tr></thead><tbody>{people.map((person) => { const emailMatch = person.email === NORMAL_EMAIL; const included = visible.some((item) => item.email === person.email); return <tr key={person.email} className={included && !emailMatch ? "bg-danger/10" : "border-t border-white/5"}><td className="p-3 text-text">{person.item} · {person.name}</td><td className="p-3">{emailMatch ? "verdadeiro" : "falso"}</td><td className="p-3">{emailMatch ? "verdadeiro" : injectedTruth ? "falso OR verdadeiro = verdadeiro" : "falso"}</td><td className={`p-3 font-semibold ${included && !emailMatch ? "text-danger" : included ? "text-defense" : "text-muted"}`}>{included ? "Sim" : "Não"}</td></tr>; })}</tbody></table></div>
      {injectedTruth ? <p className="m-4 rounded-xl border border-danger/35 bg-danger/10 p-3 text-sm font-semibold text-danger">Vazamento reproduzido: Bruno entrou porque a condição adicionada era verdadeira, não porque o email dele correspondia.</p> : <p className="m-4 rounded-xl border border-defense/30 bg-defense/10 p-3 text-sm text-defense">O filtro ainda depende do email. Somente Alice foi incluída.</p>}
    </section>
  );
}

function DefenseComparison({ input }: { input: string }) {
  return (
    <section className="rounded-[18px] border border-defense/35 bg-defense/5 p-4">
      <h4 className="text-base font-semibold text-defense">2. O banco não analisa o parâmetro como SQL</h4>
      <p className="mt-2 text-sm leading-6 text-muted">O banco já recebeu a instrução com uma vaga. Depois recebe todo o texto abaixo como um único valor de email:</p>
      <code className="mt-3 block break-words rounded-xl border border-info/25 bg-black/25 p-3 text-sm text-info">{input}</code>
      <p className="mt-3 text-sm font-semibold text-defense">Nenhuma conta possui esse email literal. Resultado: zero pedidos, sem vazamento.</p>
    </section>
  );
}

function Evidence({ tone, title, children }: { tone: "warning"; title: string; children: React.ReactNode }) {
  return <section className={`rounded-[18px] border p-4 ${tone === "warning" ? "border-danger/35 bg-danger/10" : "border-line"}`}><h4 className="font-semibold text-danger">{title}</h4><p className="mt-2 text-sm leading-6 text-muted">{children}</p></section>;
}

function StepConclusion({ step }: { step: Step }) {
  const messages: Record<Step, string> = {
    normal: "Linha de base concluída: o resultado esperado é somente Alice.",
    quote: "A aspa encerra um valor textual. Quando a entrada controla essa fronteira, ela pode alcançar a gramática SQL.",
    false: "OR sozinho não basta. A nova condição precisa ser verdadeira para ampliar o resultado.",
    true: "Ataque entendido: fechar o valor + adicionar OR + criar uma condição verdadeira alterou o filtro.",
    build: "Você montou a sequência e reproduziu o efeito sem apenas copiar um texto pronto.",
    defense: "Defesa entendida: parâmetros preservam o texto inteiro como dado, mesmo quando ele parece SQL.",
  };
  return <p className="rounded-[16px] border border-accent/30 bg-accent/5 p-4 text-sm font-semibold text-accent" role="status">{messages[step]}</p>;
}

function stepInput(step: Step, built: string[]) {
  if (step === "quote") return QUOTE_EMAIL;
  if (step === "false") return FALSE_EMAIL;
  if (step === "true" || step === "defense") return TRUE_EMAIL;
  if (step === "build") return built.map((id) => BUILD_PARTS.find((part) => part.id === id)?.label).filter(Boolean).join(" ");
  return NORMAL_EMAIL;
}

function shortLabel(step: Step) {
  if (step === "normal") return "Normal";
  if (step === "quote") return "Aspa";
  if (step === "false") return "OR falso";
  if (step === "true") return "OR verdadeiro";
  if (step === "build") return "Montar";
  return "Defender";
}
