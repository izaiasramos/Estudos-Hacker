"use client";

import { useState } from "react";
import { emitAudioOutcome } from "@/lib/audio-events";

type Result = "idle" | "success" | "retry";

const roles = [
  { id: "js", code: "email em function findUser(db, email)", answer: "function", label: "Parâmetro da função JavaScript" },
  { id: "slot", code: "? em WHERE email = ?", answer: "placeholder", label: "Vaga da instrução SQL" },
  { id: "values", code: "[email] em db.query(sql, [email])", answer: "values", label: "Lista de valores entregue ao driver" },
  { id: "concrete", code: '"alice@exemplo.test" na chamada', answer: "concrete", label: "Valor concreto recebido pela função" },
];

export function SqlDefensePractice({ mode }: { mode: "roles" | "spot" | "assemble" }) {
  if (mode === "roles") return <RolesPractice />;
  if (mode === "spot") return <SpotPractice />;
  return <AssemblePractice />;
}

function Shell({ title, instruction, children }: { title: string; instruction: string; children: React.ReactNode }) {
  return <section className="my-8 overflow-hidden rounded-[22px] border border-defense/35 bg-[linear-gradient(145deg,rgba(77,255,164,0.07),rgba(8,10,16,0.84))]"><header className="border-b border-defense/20 p-5 sm:px-6"><span className="rounded-full bg-defense/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-defense">Prática defensiva</span><h3 className="mt-3 text-xl font-semibold text-text">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{instruction}</p></header><div className="p-5 sm:p-6">{children}</div></section>;
}

function Feedback({ result, success, retry }: { result: Result; success: string; retry: string }) {
  if (result === "idle") return null;
  return <p className={`mt-4 rounded-xl border p-3 text-sm leading-6 ${result === "success" ? "border-defense/35 bg-defense/10 text-defense" : "border-danger/35 bg-danger/10 text-danger"}`} role={result === "success" ? "status" : "alert"}>{result === "success" ? success : retry}</p>;
}

function RolesPractice() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>("idle");
  function check() { const ok = roles.every((item) => answers[item.id] === item.answer); setResult(ok ? "success" : "retry"); emitAudioOutcome({ outcome: ok ? "success" : "error", id: `sql-roles:${Date.now()}` }); }
  return <Shell title="Separe os três tipos de parâmetro" instruction="A palavra parâmetro aparece em dois lugares diferentes. Associe cada trecho ao papel correto."><div className="space-y-3">{roles.map((item) => <label key={item.id} className="grid gap-3 rounded-xl border border-line bg-ink/65 p-4 sm:grid-cols-[1fr_17rem] sm:items-center"><code className="break-words text-sm text-info">{item.code}</code><select value={answers[item.id] ?? ""} onChange={(event) => { setAnswers((current) => ({ ...current, [item.id]: event.target.value })); setResult("idle"); }} className="min-h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm text-text"><option value="">Escolha o papel</option>{roles.map((option) => <option key={option.answer} value={option.answer}>{option.label}</option>)}</select></label>)}</div><button type="button" onClick={check} className="mt-4 min-h-11 rounded-full bg-defense px-5 text-sm font-bold text-ink">Conferir papéis</button><Feedback result={result} success="Correto. A função recebe um valor; o SQL contém uma vaga; o driver associa a lista de valores às vagas." retry="Observe onde cada item vive: assinatura JavaScript, texto SQL, segundo argumento de db.query ou chamada concreta." /></Shell>;
}

function SpotPractice() {
  const lines = [
    { id: "read", code: "const email = String(form.get('email') ?? '')" },
    { id: "call", code: "return findUser(db, email)" },
    { id: "bad", code: `return db.query("SELECT usuario_id FROM usuarios WHERE email_usuario = '" + email + "'")` },
    { id: "safe", code: `return db.query("SELECT usuario_id FROM usuarios WHERE email_usuario = ?", [email])` },
  ];
  const [picked, setPicked] = useState("");
  const [result, setResult] = useState<Result>("idle");
  function check() { const ok = picked === "bad"; setResult(ok ? "success" : "retry"); emitAudioOutcome({ outcome: ok ? "success" : "error", id: `sql-spot:${Date.now()}` }); }
  return <Shell title="Encontre onde a entrada vira instrução" instruction="Receber o email e passá-lo para uma função é normal. Clique na linha que mistura o valor ao SQL."><div className="overflow-hidden rounded-xl border border-line-strong bg-[#05070b]">{lines.map((line, index) => <button key={line.id} type="button" onClick={() => { setPicked(line.id); setResult("idle"); }} className={`grid w-full grid-cols-[2rem_1fr] gap-3 border-b border-line p-3 text-left font-mono text-sm last:border-0 ${picked === line.id ? "bg-info/15 text-info" : "text-text hover:bg-white/[0.04]"}`}><span className="text-right text-muted">{index + 1}</span><code className="break-words whitespace-pre-wrap">{line.code}</code></button>)}</div><button type="button" onClick={check} disabled={!picked} className="mt-4 min-h-11 rounded-full bg-defense px-5 text-sm font-bold text-ink disabled:opacity-50">Analisar linha</button><Feedback result={result} success="Exato. O + funde email e instrução em um texto único antes de o banco interpretar." retry="A origem do dado não é o problema. Procure o ponto onde email participa da construção da string SQL." /></Shell>;
}

function AssemblePractice() {
  const [query, setQuery] = useState("");
  const [values, setValues] = useState("");
  const [result, setResult] = useState<Result>("idle");
  function check() { const ok = query === "fixed" && values === "array"; setResult(ok ? "success" : "retry"); emitAudioOutcome({ outcome: ok ? "success" : "error", id: `sql-assemble:${Date.now()}` }); }
  return <Shell title="Monte a chamada segura" instruction="Escolha o primeiro argumento, que define a instrução, e o segundo, que leva os valores."><div className="grid gap-4 sm:grid-cols-2"><label className="rounded-xl border border-line bg-ink/65 p-4"><span className="text-sm font-semibold text-text">1º argumento de db.query: instrução</span><select value={query} onChange={(event) => { setQuery(event.target.value); setResult("idle"); }} className="mt-3 min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-text"><option value="">Escolha</option><option value="mixed">{`"... email = '" + email + "'"`}</option><option value="fixed">{`"... email = ?"`}</option></select></label><label className="rounded-xl border border-line bg-ink/65 p-4"><span className="text-sm font-semibold text-text">2º argumento: valores</span><select value={values} onChange={(event) => { setValues(event.target.value); setResult("idle"); }} className="mt-3 min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-text"><option value="">Escolha</option><option value="inside">email dentro da string</option><option value="array">[email]</option></select></label></div><div className="mt-4 rounded-xl border border-white/10 bg-[#05070b] p-3 font-mono text-sm text-text">db.query(<span className="text-defense">{query === "fixed" ? '"SELECT ... WHERE email = ?"' : query === "mixed" ? '"SELECT ... email = \'" + email + "\'"' : "primeiro argumento"}</span>, <span className="text-info">{values === "array" ? "[email]" : values === "inside" ? "email misturado" : "segundo argumento"}</span>)</div><button type="button" onClick={check} disabled={!query || !values} className="mt-4 min-h-11 rounded-full bg-defense px-5 text-sm font-bold text-ink disabled:opacity-50">Testar montagem</button><Feedback result={result} success="Montagem correta. Um ? corresponde ao primeiro item, email. Com dois ?, os valores seguiriam a mesma ordem no array." retry="A instrução precisa permanecer fixa com ?. O valor deve aparecer no segundo argumento, dentro da lista." /></Shell>;
}
