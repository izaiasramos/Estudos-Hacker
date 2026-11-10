"use client";

import { useState } from "react";
import { emitAudioOutcome } from "@/lib/audio-events";

type Topic = "session" | "auth" | "xss" | "csrf" | "phishing" | "idor" | "headers" | "ssrf" | "upload";
type Scenario = {
  title: string;
  observe: string;
  vulnerable: string;
  diagnoses: { id: string; label: string }[];
  answer: string;
  fixes: { id: string; label: string; code: string }[];
  fix: string;
  tests: { name: string; before: string; after: string }[];
  lesson: string;
};

const SCENARIOS: Record<Topic, Scenario> = {
  session: {
    title: "Feche o ciclo de uma sessão",
    observe: "Alice recebe uma chave antes do login. Depois de entrar, o servidor mantém a mesma chave. No logout, apaga apenas o cookie do navegador.",
    vulnerable: `const sid = cookies.sid ?? randomId()\nsessions.set(sid, { userId: alice.id })\n// logout: só remove o cookie`,
    diagnoses: [{ id: "flags", label: "Faltam somente atributos no cookie" }, { id: "cycle", label: "A chave não gira no login nem é revogada no servidor" }, { id: "length", label: "A chave é curta demais" }],
    answer: "cycle",
    fixes: [{ id: "keep", label: "Manter a chave e adicionar Max-Age", code: `setCookie("sid", sid, { maxAge: 3600 })` }, { id: "rotate", label: "Invalidar a antiga, criar uma nova e revogar no logout", code: `sessions.delete(oldSid)\nconst sid = randomId()\nsessions.set(sid, { userId: alice.id })\n// logout: sessions.delete(sid)` }],
    fix: "rotate",
    tests: [{ name: "Login troca a chave", before: "falha: chave igual", after: "passa: chave nova" }, { name: "Chave antiga deixa de funcionar", before: "falha: ainda válida", after: "passa: revogada" }, { name: "Logout encerra no servidor", before: "falha: registro vivo", after: "passa: registro removido" }],
    lesson: "Cookies protegem o transporte. Rotação e revogação protegem o ciclo de vida da chave.",
  },
  auth: {
    title: "Endureça um login sem revelar contas",
    observe: "O login responde “conta inexistente” para um email e “senha errada” para outro. A senha também está legível no registro.",
    vulnerable: `if (!user) return reply(404, "Conta inexistente")\nif (user.password !== password) return reply(401, "Senha errada")`,
    diagnoses: [{ id: "session", label: "É apenas um problema de sessão" }, { id: "enum", label: "A resposta enumera contas e a senha não usa hash próprio" }, { id: "email", label: "O email deveria ser criptografado" }],
    answer: "enum",
    fixes: [{ id: "detail", label: "Manter mensagens diferentes para ajudar o usuário", code: `return reply(404, "Conta inexistente")` }, { id: "generic", label: "Verificar hash e usar a mesma falha para credenciais inválidas", code: `const valid = await passwordHasher.verify(hash, password)\nif (!user || !valid) return reply(401, "Credenciais inválidas")` }],
    fix: "generic",
    tests: [{ name: "Email inexistente e senha errada parecem iguais", before: "falha: respostas diferentes", after: "passa: 401 genérico" }, { name: "Banco não guarda senha legível", before: "falha: texto puro", after: "passa: salt + hash" }, { name: "Falhas repetidas desaceleram", before: "falha: ilimitado", after: "passa: rate limit" }],
    lesson: "Hash protege a senha armazenada. Resposta genérica reduz enumeração. Rate limit reduz palpites em massa.",
  },
  xss: {
    title: "Impeça um comentário de virar página",
    observe: "Um comentário chega como texto, mas o painel o entrega a innerHTML. O navegador passa a interpretar marcação.",
    vulnerable: `function renderComment(panel, comment) {\n  panel.innerHTML = comment\n}`,
    diagnoses: [{ id: "input", label: "O problema é receber comentários" }, { id: "sink", label: "innerHTML transforma dado em estrutura HTML" }, { id: "database", label: "O banco deveria escapar o texto" }],
    answer: "sink",
    fixes: [{ id: "replace", label: "Remover os caracteres < e > manualmente", code: `panel.innerHTML = comment.replaceAll("<", "")` }, { id: "text", label: "Usar textContent para comentário que deve ser texto", code: `panel.textContent = comment` }],
    fix: "text",
    tests: [{ name: "Comentário normal continua visível", before: "passa", after: "passa" }, { name: "Marcação aparece como texto", before: "falha: interpretada", after: "passa: literal" }, { name: "HTML rico segue caminho sanitizado", before: "falha: sem regra", after: "passa: allowlist" }],
    lesson: "A defesa depende do contexto de saída. Para texto, use uma API que só crie texto.",
  },
  csrf: {
    title: "Prove que a transferência veio da tela certa",
    observe: "Uma página externa dispara uma transferência. O navegador anexa automaticamente o cookie válido de Alice.",
    vulnerable: `app.get("/transferir", requireSession, async (req) => {\n  return transfer(req.user.id, req.query.para, req.query.valor)\n})`,
    diagnoses: [{ id: "cookie", label: "O cookie de Alice é inválido" }, { id: "intent", label: "O servidor autentica Alice, mas não prova a intenção da requisição" }, { id: "amount", label: "O valor deveria ser texto" }],
    answer: "intent",
    fixes: [{ id: "post", label: "Trocar apenas GET por POST", code: `app.post("/transferir", requireSession, transfer)` }, { id: "token", label: "Usar POST, validar Origin e token anti-CSRF", code: `if (origin !== APP_ORIGIN) return forbidden()\nif (!csrf.valid(user.id, body.token)) return forbidden()\nreturn transfer(user.id, body.para, body.valor)` }],
    fix: "token",
    tests: [{ name: "Tela oficial com token válido", before: "passa", after: "passa" }, { name: "Site externo sem token", before: "falha: transfere", after: "passa: 403" }, { name: "Token errado", before: "falha: ignorado", after: "passa: 403" }],
    lesson: "Sessão responde quem é a pessoa. Token e origem ajudam a provar que a ação nasceu no fluxo esperado.",
  },
  phishing: {
    title: "Transforme suspeita em resposta segura",
    observe: "Uma mensagem urgente usa nome conhecido, pede senha e aponta para um domínio parecido com o oficial.",
    vulnerable: `De: Suporte TI <suporte@empresa-login.test>\n"Responda com sua senha até 16h ou sua conta será bloqueada."`,
    diagnoses: [{ id: "grammar", label: "Erros de português provam o golpe" }, { id: "signals", label: "Pedido de segredo, pressão e domínio divergente exigem confirmação independente" }, { id: "logo", label: "O logotipo confirma o remetente" }],
    answer: "signals",
    fixes: [{ id: "reply", label: "Responder pedindo mais informações", code: `Responder à própria mensagem` }, { id: "channel", label: "Não clicar; abrir o app oficial, confirmar e reportar", code: `1. Pausar\n2. Abrir canal oficial conhecido\n3. Confirmar o evento\n4. Reportar a mensagem` }],
    fix: "channel",
    tests: [{ name: "Nenhum segredo é enviado", before: "falha: mensagem pede senha", after: "passa" }, { name: "Confirmação usa canal independente", before: "falha: link da mensagem", after: "passa: app oficial" }, { name: "Colegas recebem proteção", before: "falha: sem reporte", after: "passa: reportada" }],
    lesson: "Sinais geram suspeita. A decisão profissional vem de confirmar por um caminho que a mensagem não controla.",
  },
  idor: {
    title: "Vincule o recurso à pessoa da sessão",
    observe: "Alice altera /pedidos/101 para /pedidos/103. A rota busca somente pelo ID e devolve o pedido de Bruno.",
    vulnerable: `const order = await orderRepository.findById(params.orderId)\nreturn Response.json(order)`,
    diagnoses: [{ id: "uuid", label: "O ID precisa ser mais difícil de adivinhar" }, { id: "owner", label: "A consulta não relaciona o pedido ao dono da sessão" }, { id: "login", label: "Alice não está autenticada" }],
    answer: "owner",
    fixes: [{ id: "hidden", label: "Trocar o número por UUID", code: `orderRepository.findById(params.orderUuid)` }, { id: "filter", label: "Buscar por ID e dono vindo da sessão", code: `orderRepository.findOne({ orderId: params.orderId, ownerUserId: session.userId })` }],
    fix: "filter",
    tests: [{ name: "Alice lê o pedido dela", before: "passa", after: "passa" }, { name: "Alice tenta pedido de Bruno", before: "falha: 200 com dados", after: "passa: 404 sem corpo" }, { name: "Resposta expõe só campos permitidos", before: "falha: registro inteiro", after: "passa: DTO" }],
    lesson: "Identificador localiza. Autorização decide se a pessoa da sessão pode acessar aquele recurso.",
  },
  headers: {
    title: "Reduza o que a resposta revela",
    observe: "A rota de perfil devolve o registro inteiro, stack de erro, versão do framework e nenhuma política ao navegador.",
    vulnerable: `res.setHeader("X-Powered-By", "Express 4.17.1")\nres.json(userRecord)\n// erro: res.json({ stack: error.stack })`,
    diagnoses: [{ id: "css", label: "A tela precisa esconder os campos com CSS" }, { id: "boundary", label: "A resposta foi montada sem lista de campos e sem políticas" }, { id: "encrypt", label: "Todo JSON deveria ser criptografado" }],
    answer: "boundary",
    fixes: [{ id: "client", label: "Apagar campos no JavaScript do navegador", code: `delete response.passwordHash` }, { id: "dto", label: "Criar resposta permitida no servidor e configurar headers", code: `res.json({ id: user.id, name: user.name, email: user.email })\nres.setHeader("X-Content-Type-Options", "nosniff")` }],
    fix: "dto",
    tests: [{ name: "Sem hash ou token no JSON", before: "falha: expostos", after: "passa" }, { name: "Erro público sem stack", before: "falha: caminho interno", after: "passa: errorId" }, { name: "Navegador recebe políticas", before: "falha: ausentes", after: "passa: CSP/HSTS/nosniff" }],
    lesson: "Se chegou ao navegador, já saiu do servidor. Reduza o corpo e envie políticas antes da resposta.",
  },
  ssrf: {
    title: "Valide o destino realmente conectado",
    observe: "A prévia aceita uma URL pública, mas o nome resolve para IP privado ou redireciona para um endereço interno.",
    vulnerable: `async function preview(url) {\n  const response = await fetch(url)\n  return response.text()\n}`,
    diagnoses: [{ id: "word", label: "Faltou bloquear a palavra localhost" }, { id: "destination", label: "O código valida texto, mas não controla DNS, IP e redirects" }, { id: "json", label: "A resposta deveria ser JSON" }],
    answer: "destination",
    fixes: [{ id: "regex", label: "Bloquear localhost com expressão regular", code: `if (/localhost/.test(url)) throw Error()` }, { id: "resolve", label: "Restringir protocolo, validar IP e revalidar cada salto", code: `const target = await policy.resolveAndPin(url)\nreturn safeFetch(target, { redirect: "manual", limits })` }],
    fix: "resolve",
    tests: [{ name: "HTTPS público permitido", before: "passa", after: "passa" }, { name: "Nome resolve para 10.0.0.12", before: "falha: conecta", after: "passa: bloqueado" }, { name: "Redirect termina em metadata", before: "falha: segue", after: "passa: revalidado" }],
    lesson: "A política deve acompanhar URL, DNS, IP conectado e cada redirect. Comparar apenas palavras não basta.",
  },
  upload: {
    title: "Tire do cliente as decisões sobre o arquivo",
    observe: "O servidor confia no nome e no Content-Type enviados e publica os bytes diretamente na origem do app.",
    vulnerable: `const file = form.get("avatar")\nawait writeFile("public/uploads/" + file.name, await file.bytes())`,
    diagnoses: [{ id: "extension", label: "A extensão precisa ter três letras" }, { id: "trust", label: "Nome, tipo, tamanho e bytes continuam sob controle do cliente" }, { id: "database", label: "O arquivo deveria ir para SQL" }],
    answer: "trust",
    fixes: [{ id: "mime", label: "Confiar em file.type e manter o nome", code: `if (file.type === "image/png") save(file.name)` }, { id: "pipeline", label: "Limitar, decodificar, reprocessar, renomear e publicar isolado", code: `const image = await decodeWithLimit(file)\nconst safe = await encodePng(image)\nawait mediaStore.put(randomId() + ".png", safe)` }],
    fix: "pipeline",
    tests: [{ name: "Imagem válida reprocessada", before: "falha: bytes originais", after: "passa" }, { name: "HTML chamado foto.png", before: "falha: publicado", after: "passa: recusado" }, { name: "Nome ../../.env", before: "falha: vira caminho", after: "passa: nome gerado" }],
    lesson: "O servidor decide conteúdo, limite, nome, local e forma de entrega. Metadados do cliente são apenas alegações.",
  },
};

export function SecurityPractice({ topic }: { topic: Topic }) {
  const scenario = SCENARIOS[topic];
  const [phase, setPhase] = useState<"observe" | "diagnose" | "patch" | "verify">("observe");
  const [diagnosis, setDiagnosis] = useState("");
  const [patch, setPatch] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "retry" | "success">("idle");

  function checkDiagnosis() {
    const ok = diagnosis === scenario.answer;
    setFeedback(ok ? "success" : "retry");
    emitAudioOutcome({ outcome: ok ? "success" : "error", id: `${topic}:diagnose:${Date.now()}` });
    if (ok) setPhase("patch");
  }
  function checkPatch() {
    const ok = patch === scenario.fix;
    setFeedback(ok ? "success" : "retry");
    emitAudioOutcome({ outcome: ok ? "success" : "error", id: `${topic}:patch:${Date.now()}` });
    if (ok) setPhase("verify");
  }

  return (
    <section className="my-8 overflow-hidden rounded-[24px] border border-info/35 bg-[linear-gradient(145deg,rgba(114,183,255,0.07),rgba(8,10,16,0.9))]">
      <header className="border-b border-info/20 p-5 sm:px-6"><span className="rounded-full bg-info/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-info">Laboratório guiado</span><h3 className="mt-3 text-xl font-semibold text-text">{scenario.title}</h3><p className="mt-2 text-sm text-muted">Observe → diagnostique → corrija → verifique. Tudo usa dados fictícios e código predefinido.</p></header>
      <div className="grid grid-cols-4 border-b border-white/10 text-center text-xs font-semibold sm:text-sm">{["Observar", "Diagnosticar", "Corrigir", "Verificar"].map((label, index) => <div key={label} className={`p-3 ${index <= ["observe", "diagnose", "patch", "verify"].indexOf(phase) ? "bg-info/10 text-info" : "text-muted"}`}>{index + 1}. {label}</div>)}</div>
      <div className="p-5 sm:p-6">
        {phase === "observe" ? <><p className="text-sm leading-6 text-muted">{scenario.observe}</p><pre className="mt-4 overflow-x-auto rounded-xl border border-danger/30 bg-[#05070b] p-4 text-sm leading-6 text-text"><code>{scenario.vulnerable}</code></pre><button type="button" onClick={() => { setPhase("diagnose"); setFeedback("idle"); }} className="mt-4 min-h-11 rounded-full bg-info px-5 text-sm font-bold text-ink">Investigar o problema</button></> : null}
        {phase === "diagnose" ? <fieldset><legend className="text-base font-semibold text-text">Qual é a causa técnica?</legend><div className="mt-3 space-y-2">{scenario.diagnoses.map((item) => <label key={item.id} className="flex cursor-pointer gap-3 rounded-xl border border-line p-3 text-sm text-text has-[:checked]:border-info has-[:checked]:bg-info/10"><input type="radio" name={`${topic}-diagnosis`} checked={diagnosis === item.id} onChange={() => { setDiagnosis(item.id); setFeedback("idle"); }} className="accent-[#72b7ff]" />{item.label}</label>)}</div><button type="button" onClick={checkDiagnosis} disabled={!diagnosis} className="mt-4 min-h-11 rounded-full bg-info px-5 text-sm font-bold text-ink disabled:opacity-45">Conferir diagnóstico</button><PracticeFeedback state={feedback} success="Diagnóstico correto. Agora escolha uma correção que trate a causa." /></fieldset> : null}
        {phase === "patch" ? <fieldset><legend className="text-base font-semibold text-text">Qual mudança corrige a causa?</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{scenario.fixes.map((item) => <label key={item.id} className="cursor-pointer rounded-xl border border-line bg-ink/60 p-4 has-[:checked]:border-defense has-[:checked]:bg-defense/5"><span className="flex gap-2 text-sm font-semibold text-text"><input type="radio" name={`${topic}-patch`} checked={patch === item.id} onChange={() => { setPatch(item.id); setFeedback("idle"); }} className="accent-[#4dffa4]" />{item.label}</span><pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-xs leading-5 text-muted"><code>{item.code}</code></pre></label>)}</div><button type="button" onClick={checkPatch} disabled={!patch} className="mt-4 min-h-11 rounded-full bg-defense px-5 text-sm font-bold text-ink disabled:opacity-45">Aplicar correção simulada</button><PracticeFeedback state={feedback} success="Correção aplicada ao cenário. Falta repetir os casos para provar o resultado." /></fieldset> : null}
        {phase === "verify" ? <><h4 className="text-base font-semibold text-text">Os mesmos casos, antes e depois</h4><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-y border-white/10 text-xs uppercase text-muted"><tr><th className="p-3">Teste</th><th className="p-3">Antes</th><th className="p-3">Depois</th></tr></thead><tbody>{scenario.tests.map((test) => <tr key={test.name} className="border-b border-white/5"><td className="p-3 text-text">{test.name}</td><td className="p-3 text-danger">{test.before}</td><td className="p-3 text-defense">{test.after}</td></tr>)}</tbody></table></div><p className="mt-4 rounded-xl border border-defense/35 bg-defense/10 p-4 text-sm font-semibold text-defense" role="status">{scenario.lesson}</p><button type="button" onClick={() => { setPhase("observe"); setDiagnosis(""); setPatch(""); setFeedback("idle"); }} className="mt-4 min-h-11 rounded-full border border-white/15 px-5 text-sm text-text">Praticar novamente</button></> : null}
      </div>
    </section>
  );
}

function PracticeFeedback({ state, success }: { state: "idle" | "retry" | "success"; success: string }) {
  if (state === "idle") return null;
  return <p className={`mt-3 rounded-xl border p-3 text-sm ${state === "success" ? "border-defense/35 bg-defense/10 text-defense" : "border-danger/35 bg-danger/10 text-danger"}`} role={state === "success" ? "status" : "alert"}>{state === "success" ? success : "Essa opção trata um sintoma ou cria outra fragilidade. Volte à evidência e tente de novo."}</p>;
}
