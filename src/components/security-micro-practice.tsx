"use client";

import { useState } from "react";
import { emitAudioOutcome } from "@/lib/audio-events";

type Topic = "session" | "auth" | "xss" | "csrf" | "phishing" | "idor" | "headers" | "ssrf" | "upload";
type Item = { id: string; prompt: string; options: { id: string; label: string }[]; answer: string; explain: string };

const PRACTICES: Record<Topic, { title: string; instruction: string; items: Item[] }> = {
  session: { title: "Leia o ciclo, não só o cookie", instruction: "Escolha a decisão que fecha cada momento da sessão.", items: [
    { id: "login", prompt: "Alice terminou o login usando uma chave que já existia antes.", options: opts(["flags", "Adicionar só HttpOnly"], ["rotate", "Invalidar a antiga e emitir uma nova"]), answer: "rotate", explain: "Rotação impede que uma chave preparada antes do login continue representando Alice." },
    { id: "logout", prompt: "O navegador apagou o cookie, mas o registro continua no servidor.", options: opts(["clear", "Só limpar o cookie"], ["revoke", "Revogar o registro e limpar o cookie"]), answer: "revoke", explain: "Quem ainda possuir a chave poderia usá-la enquanto o servidor a aceitasse." },
  ]},
  auth: { title: "Separe as camadas do login", instruction: "Relacione cada problema à defesa que age diretamente nele.", items: [
    { id: "store", prompt: "O banco guarda pizza123 legível.", options: opts(["hash", "Hash próprio para senha com salt"], ["generic", "Mensagem genérica"]), answer: "hash", explain: "Hash de senha reduz o dano quando o banco vaza." },
    { id: "enum", prompt: "A resposta diz se a conta existe.", options: opts(["hash", "Hash"], ["generic", "Mesma resposta para credenciais inválidas"]), answer: "generic", explain: "A resposta uniforme reduz enumeração de usuários." },
    { id: "guess", prompt: "Milhares de tentativas chegam em segundos.", options: opts(["rate", "Rate limiting e atraso progressivo"], ["encrypt", "Criptografar o email"]), answer: "rate", explain: "Limitar tentativas aumenta o custo do ataque online." },
  ]},
  xss: { title: "Escolha a saída pelo contexto", instruction: "A mesma entrada exige decisões diferentes conforme onde será exibida.", items: [
    { id: "text", prompt: "Comentário deve aparecer como texto comum.", options: opts(["inner", "innerHTML"], ["text", "textContent"]), answer: "text", explain: "textContent cria texto, não estrutura HTML." },
    { id: "rich", prompt: "Editor permite somente negrito e links HTTPS.", options: opts(["raw", "innerHTML sem tratamento"], ["sanitize", "Sanitização com lista permitida"]), answer: "sanitize", explain: "HTML rico precisa de um sanitizador adequado ao contexto e regras explícitas." },
  ]},
  csrf: { title: "Trace a intenção da requisição", instruction: "Diga se cada pedido prova que nasceu no fluxo oficial.", items: [
    { id: "cookie", prompt: "POST leva cookie válido, mas não tem token nem Origin conferido.", options: opts(["accept", "Aceitar: Alice está logada"], ["reject", "Recusar: falta prova de intenção"]), answer: "reject", explain: "O navegador pode anexar cookies automaticamente a uma requisição iniciada por outro site." },
    { id: "valid", prompt: "POST, Origin oficial e token ligado à sessão conferem.", options: opts(["accept", "Aceitar"], ["reject", "Recusar sempre"]), answer: "accept", explain: "Nesse cenário, as verificações ligam a mutação ao fluxo esperado." },
  ]},
  phishing: { title: "Verifique sem clicar", instruction: "Escolha a ação profissional para cada sinal.", items: [
    { id: "domain", prompt: "O link mostra empresa.test.login-seguro.example.", options: opts(["start", "Confiar porque começa com empresa.test"], ["end", "Ler o hostname real e abrir o app oficial"]), answer: "end", explain: "O domínio controlado é definido pelo final registrável, não pelas palavras do começo." },
    { id: "boss", prompt: "Mensagem do diretor pede um código urgente.", options: opts(["reply", "Responder no mesmo fio"], ["independent", "Confirmar pelo contato já conhecido"]), answer: "independent", explain: "Um canal independente não fica sob controle da mensagem suspeita." },
  ]},
  idor: { title: "Identificador não é autorização", instruction: "Decida usando a identidade da sessão e o dono do recurso.", items: [
    { id: "own", prompt: "Alice pede o pedido 101, cujo user_id é Alice.", options: opts(["allow", "Permitir os campos autorizados"], ["deny", "Negar"]), answer: "allow", explain: "A pessoa da sessão é dona do recurso." },
    { id: "other", prompt: "Alice pede o pedido 103, cujo user_id é Bruno.", options: opts(["allow", "Permitir porque conhece o ID"], ["deny", "403/404 sem conteúdo"]), answer: "deny", explain: "Conhecer um ID não concede acesso ao recurso." },
  ]},
  headers: { title: "Revise o que realmente saiu", instruction: "A tela não é a fronteira. Classifique cada item da resposta.", items: [
    { id: "hash", prompt: "password_hash chegou no JSON, mas a tela não mostra.", options: opts(["safe", "Seguro porque está oculto"], ["leak", "Vazamento: já chegou ao cliente"]), answer: "leak", explain: "Ferramentas de rede e scripts ainda conseguem ler o campo." },
    { id: "error", prompt: "Erro público devolve apenas errorId; stack fica no log interno.", options: opts(["safe", "Separação adequada"], ["leak", "Precisa devolver a stack"]), answer: "safe", explain: "O usuário recebe referência; a equipe preserva detalhes no ambiente interno." },
  ]},
  ssrf: { title: "Siga o destino até a conexão", instruction: "A URL visível é apenas o começo. Decida em cada caso.", items: [
    { id: "dns", prompt: "https://fotos.example resolve para 10.0.0.12.", options: opts(["allow", "Permitir porque usa HTTPS"], ["deny", "Bloquear o IP privado"]), answer: "deny", explain: "HTTPS não torna um destino interno apropriado." },
    { id: "redirect", prompt: "Destino público redireciona para endereço de metadata.", options: opts(["follow", "Seguir automaticamente"], ["revalidate", "Revalidar o novo destino"]), answer: "revalidate", explain: "Cada salto cria uma nova decisão de segurança." },
  ]},
  upload: { title: "Trate metadados como alegações", instruction: "Escolha a evidência que o servidor deve usar.", items: [
    { id: "mime", prompt: "foto.png declara image/png, mas os bytes são HTML.", options: opts(["trust", "Confiar no nome e Content-Type"], ["decode", "Decodificar e reprocessar como imagem"]), answer: "decode", explain: "Nome e Content-Type vêm do cliente. O decoder valida se os bytes formam uma imagem." },
    { id: "name", prompt: "O nome enviado é ../../.env.", options: opts(["join", "Usar path.join com o nome"], ["generate", "Ignorar o nome e gerar um identificador"]), answer: "generate", explain: "O cliente não deve escolher o caminho de armazenamento." },
  ]},
};

function opts(...entries: [string, string][]) { return entries.map(([id, label]) => ({ id, label })); }

export function SecurityMicroPractice({ topic }: { topic: Topic }) {
  const practice = PRACTICES[topic];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct = practice.items.filter((item) => answers[item.id] === item.answer).length;
  function check() { setChecked(true); const ok = correct === practice.items.length; emitAudioOutcome({ outcome: ok ? "success" : "error", id: `micro:${topic}:${Date.now()}` }); }
  return <section className="my-8 overflow-hidden rounded-[22px] border border-info/30 bg-ink/50"><header className="border-b border-info/20 p-5"><span className="text-xs font-bold uppercase tracking-wide text-info">Prática rápida</span><h3 className="mt-2 text-xl font-semibold text-text">{practice.title}</h3><p className="mt-2 text-sm text-muted">{practice.instruction}</p></header><div className="space-y-4 p-5">{practice.items.map((item, index) => { const right = answers[item.id] === item.answer; return <fieldset key={item.id} className="rounded-xl border border-line p-4"><legend className="px-1 text-sm font-semibold text-text">{index + 1}. {item.prompt}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{item.options.map((option) => <label key={option.id} className="cursor-pointer rounded-xl border border-line-strong p-3 text-sm text-muted has-[:checked]:border-info has-[:checked]:bg-info/10 has-[:checked]:text-text"><input type="radio" name={`${topic}-${item.id}`} checked={answers[item.id] === option.id} onChange={() => { setAnswers((current) => ({ ...current, [item.id]: option.id })); setChecked(false); }} className="mr-2 accent-[#72b7ff]" />{option.label}</label>)}</div>{checked ? <p className={`mt-3 text-sm ${right ? "text-defense" : "text-danger"}`}>{right ? "Correto. " : "Revise. "}{item.explain}</p> : null}</fieldset>; })}<button type="button" onClick={check} disabled={Object.keys(answers).length !== practice.items.length} className="min-h-11 rounded-full bg-info px-5 text-sm font-bold text-ink disabled:opacity-45">Conferir decisões</button>{checked ? <p className={`text-sm font-semibold ${correct === practice.items.length ? "text-defense" : "text-danger"}`} role="status">{correct} de {practice.items.length} decisões corretas.</p> : null}</div></section>;
}
