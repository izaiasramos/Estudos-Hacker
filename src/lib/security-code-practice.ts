export const SECURITY_TOPICS = ["session", "auth", "xss", "csrf", "phishing", "idor", "headers", "ssrf", "upload"] as const;
export type SecurityTopic = (typeof SECURITY_TOPICS)[number];
export type CodeLevelKind = "piece" | "extend" | "complete" | "review";

export type CodeLevel = {
  id: CodeLevelKind;
  title: string;
  context: string;
  task: string;
  steps: string[];
  hints: [string, string, string];
  starter: string;
  solution: string;
  required: { label: string; pattern: string; explanation: string }[];
  forbidden?: { label: string; pattern: string; explanation: string }[];
  lines: { line: number; code: string; explanation: string }[];
};

export type CodePractice = {
  title: string;
  summary: string;
  language: "javascript" | "text";
  anatomy: { name: string; role: string }[];
  exampleCall: string;
  levels: [CodeLevel, CodeLevel, CodeLevel, CodeLevel];
  tests: string[];
};

type Curriculum = {
  title: string;
  summary: string;
  language?: "javascript" | "text";
  pieces: [string, string, string];
  functionName: string;
  signature: string;
  anatomy?: { name: string; role: string }[];
  exampleCall?: string;
  vulnerable: string;
  solution: string;
  rules: { label: string; pattern: string; explanation: string }[];
  forbidden?: { label: string; pattern: string; explanation: string }[];
  lines: { code: string; explanation: string }[];
  tests: string[];
};

const CURRICULA: Record<SecurityTopic, Curriculum> = {
  session: {
    title: "Escreva o ciclo seguro de uma sessão",
    summary: "Você começa girando a chave, depois revoga a antiga e termina montando login e logout.",
    pieces: ["Gerar uma chave nova", "Revogar a chave anterior", "Persistir a nova sessão e devolvê-la"],
    functionName: "finishLogin",
    signature: "function finishLogin(sessions, oldSid, userId) {",
    anatomy: [
      { name: "finishLogin", role: "função chamada depois que email e senha já foram confirmados" },
      { name: "sessions", role: "memória simulada do servidor; delete revoga e set registra uma sessão" },
      { name: "oldSid", role: "chave que existia antes do login e não pode sobreviver à autenticação" },
      { name: "userId", role: "identidade confirmada que será ligada à nova chave" },
      { name: "randomId()", role: "função fornecida pela plataforma que cria uma chave imprevisível" },
    ],
    exampleCall: 'finishLogin(sessions, "sid-antes", "alice")',
    vulnerable: "function finishLogin(sessions, oldSid, userId) {\n  sessions.set(oldSid, { userId })\n  return oldSid\n}",
    solution: "function finishLogin(sessions, oldSid, userId) {\n  sessions.delete(oldSid)\n  const newSid = randomId()\n  sessions.set(newSid, { userId })\n  return newSid\n}",
    rules: [
      { label: "Revogar a chave antiga", pattern: "sessions\\.delete\\(oldSid\\)", explanation: "A chave anterior não pode continuar representando Alice." },
      { label: "Gerar uma chave nova", pattern: "const\\s+newSid\\s*=\\s*randomId\\(\\)", explanation: "A autenticação cria uma nova fronteira de confiança." },
      { label: "Ligar a nova chave ao usuário", pattern: "sessions\\.set\\(newSid,\\s*\\{\\s*userId\\s*\\}\\)", explanation: "O registro do servidor passa a reconhecer a nova chave." },
      { label: "Devolver a chave nova", pattern: "return\\s+newSid", explanation: "O navegador deve receber a chave criada depois do login." },
    ],
    forbidden: [{ label: "Não reutilizar oldSid", pattern: "return\\s+oldSid", explanation: "Reutilizar a chave mantém a fixação de sessão." }],
    lines: [
      { code: "sessions.delete(oldSid)", explanation: "Revoga a credencial que existia antes da autenticação." },
      { code: "const newSid = randomId()", explanation: "Gera uma credencial imprevisível para a sessão autenticada." },
      { code: "sessions.set(newSid, { userId })", explanation: "Associa a identidade confirmada à nova credencial." },
      { code: "return newSid", explanation: "Entrega ao chamador somente a credencial nova." },
    ],
    tests: ["A chave muda no login", "A chave antiga falha", "A nova chave pertence a Alice", "Logout revoga o registro"],
  },
  auth: {
    title: "Construa um login que não revela contas",
    summary: "Você verifica o hash, uniformiza a falha e fecha com controle de tentativas.",
    pieces: ["Verificar a senha com o hasher", "Responder igual para credenciais inválidas", "Registrar falhas e sucesso"],
    functionName: "login",
    signature: "async function login(email, password) {",
    vulnerable: "async function login(email, password) {\n  const user = await users.findByEmail(email)\n  if (!user) return reply(404, \"Conta inexistente\")\n  if (user.password !== password) return reply(401, \"Senha errada\")\n  return reply(200, \"ok\")\n}",
    solution: "async function login(email, password) {\n  await limiter.check(email)\n  const user = await users.findByEmail(email)\n  const hash = user?.passwordHash ?? DUMMY_HASH\n  const valid = await passwordHasher.verify(hash, password)\n  if (!user || !valid) {\n    await limiter.fail(email)\n    return reply(401, \"Credenciais inválidas\")\n  }\n  await limiter.success(email)\n  return reply(200, \"ok\")\n}",
    rules: [
      { label: "Consultar o limitador", pattern: "limiter\\.check\\(email\\)", explanation: "Tentativas repetidas precisam ter custo e limite." },
      { label: "Usar hash substituto", pattern: "user\\?\\.passwordHash\\s*\\?\\?\\s*DUMMY_HASH", explanation: "Até conta inexistente percorre uma verificação parecida." },
      { label: "Verificar com passwordHasher", pattern: "passwordHasher\\.verify\\(hash,\\s*password\\)", explanation: "Senha não é comparada como texto puro." },
      { label: "Falha genérica", pattern: "Credenciais inválidas", explanation: "A resposta não informa se foi email ou senha." },
    ],
    forbidden: [{ label: "Não comparar senha em texto", pattern: "user\\.password\\s*!==\\s*password", explanation: "Isso pressupõe senha legível no banco." }],
    lines: [
      { code: "await limiter.check(email)", explanation: "Aplica a política contra palpites repetidos antes do trabalho caro." },
      { code: "const hash = user?.passwordHash ?? DUMMY_HASH", explanation: "Escolhe um hash real ou substituto sem revelar se a conta existe." },
      { code: "const valid = await passwordHasher.verify(hash, password)", explanation: "Usa uma biblioteca própria para verificar senha." },
      { code: "if (!user || !valid)", explanation: "Une os dois motivos de falha no mesmo caminho público." },
    ],
    tests: ["Conta inexistente e senha errada respondem igual", "Senha não fica legível", "Falhas repetidas desaceleram", "Login válido continua funcionando"],
  },
  xss: {
    title: "Escreva um renderer seguro por contexto",
    summary: "Você começa com texto comum, amplia para HTML rico sanitizado e explica por que cada sink importa.",
    pieces: ["Renderizar texto com textContent", "Criar elemento sem concatenar HTML", "Separar o caminho de HTML rico"],
    functionName: "renderComment",
    signature: "function renderComment(panel, comment, richText) {",
    vulnerable: "function renderComment(panel, comment) {\n  panel.innerHTML = comment\n}",
    solution: "function renderComment(panel, comment, richText) {\n  if (richText) {\n    panel.innerHTML = sanitizer.clean(comment)\n    return\n  }\n  const paragraph = document.createElement(\"p\")\n  paragraph.textContent = comment\n  panel.replaceChildren(paragraph)\n}",
    rules: [
      { label: "Sanitizar HTML rico", pattern: "sanitizer\\.clean\\(comment\\)", explanation: "Quando HTML é requisito, uma allowlist remove estruturas não permitidas." },
      { label: "Criar nó de texto", pattern: "paragraph\\.textContent\\s*=\\s*comment", explanation: "Texto comum não vira marcação." },
      { label: "Substituir filhos com DOM seguro", pattern: "panel\\.replaceChildren\\(paragraph\\)", explanation: "A API recebe um nó já construído, sem interpretar string como HTML." },
    ],
    forbidden: [{ label: "Não usar entrada crua em innerHTML", pattern: "innerHTML\\s*=\\s*comment(?:\\s|$)", explanation: "Esse sink interpreta a entrada como estrutura da página." }],
    lines: [
      { code: "if (richText)", explanation: "Explicita que HTML rico é um requisito diferente de texto comum." },
      { code: "panel.innerHTML = sanitizer.clean(comment)", explanation: "Somente conteúdo sanitizado alcança o sink HTML." },
      { code: "paragraph.textContent = comment", explanation: "No caminho comum, a entrada é sempre texto literal." },
      { code: "panel.replaceChildren(paragraph)", explanation: "Atualiza o painel com o nó seguro criado pelo código." },
    ],
    tests: ["Comentário normal aparece", "Marcação aparece como texto", "HTML rico passa pela allowlist", "Entrada crua nunca alcança innerHTML"],
  },
  csrf: {
    title: "Monte uma rota de mutação protegida",
    summary: "Você valida método, origem e token antes de alterar qualquer estado.",
    pieces: ["Exigir POST", "Conferir a origem esperada", "Validar token ligado à sessão"],
    functionName: "transferRoute",
    signature: "async function transferRoute(request, session) {",
    vulnerable: "async function transferRoute(request, session) {\n  return transfer(session.userId, request.body.to, request.body.amount)\n}",
    solution: "async function transferRoute(request, session) {\n  if (request.method !== \"POST\") return response(405)\n  if (request.origin !== APP_ORIGIN) return response(403)\n  if (!csrf.verify(session.userId, request.body.csrfToken)) {\n    return response(403)\n  }\n  return transfer(session.userId, request.body.to, request.body.amount)\n}",
    rules: [
      { label: "Exigir POST", pattern: "request\\.method\\s*!==\\s*[\"']POST[\"']", explanation: "Leitura e mutação ficam semanticamente separadas." },
      { label: "Conferir Origin", pattern: "request\\.origin\\s*!==\\s*APP_ORIGIN", explanation: "Recusa pedidos iniciados por uma origem inesperada." },
      { label: "Validar token da sessão", pattern: "csrf\\.verify\\(session\\.userId,\\s*request\\.body\\.csrfToken\\)", explanation: "Liga a intenção ao usuário e ao fluxo oficial." },
      { label: "Transferir só depois", pattern: "return\\s+transfer\\(session\\.userId", explanation: "A mudança de estado acontece após todas as barreiras." },
    ],
    lines: [
      { code: "if (request.method !== \"POST\")", explanation: "Bloqueia mutação por método de leitura." },
      { code: "if (request.origin !== APP_ORIGIN)", explanation: "Compara a origem observada com a origem permitida." },
      { code: "csrf.verify(session.userId, request.body.csrfToken)", explanation: "Confere um segredo de intenção vinculado à sessão." },
      { code: "return transfer(session.userId", explanation: "Só executa a operação depois das validações." },
    ],
    tests: ["Fluxo oficial é aceito", "GET é recusado", "Origem externa recebe 403", "Token ausente ou errado recebe 403"],
  },
  phishing: {
    title: "Escreva um fluxo seguro de triagem",
    summary: "Aqui o código organiza decisões humanas: pausar, confirmar fora da mensagem e reportar.",
    language: "javascript",
    pieces: ["Detectar pedido de segredo", "Exigir confirmação independente", "Retornar ação de reporte"],
    functionName: "triageMessage",
    signature: "function triageMessage(message) {",
    vulnerable: "function triageMessage(message) {\n  if (message.logo === \"oficial\") return \"click\"\n  return \"reply\"\n}",
    solution: "function triageMessage(message) {\n  const risky = message.requestsSecret || message.domainMismatch\n  if (risky) {\n    return { action: \"report\", confirmVia: \"official-channel\" }\n  }\n  return { action: \"open-official-app\" }\n}",
    rules: [
      { label: "Considerar pedido de segredo", pattern: "message\\.requestsSecret", explanation: "Serviços legítimos não devem pedir senha ou código por mensagem." },
      { label: "Considerar domínio divergente", pattern: "message\\.domainMismatch", explanation: "Aparência e nome não substituem a identidade técnica." },
      { label: "Confirmar por canal oficial", pattern: "confirmVia:\\s*[\"']official-channel[\"']", explanation: "A confirmação não usa um caminho controlado pela mensagem." },
      { label: "Reportar a suspeita", pattern: "action:\\s*[\"']report[\"']", explanation: "O reporte ajuda a proteger outras pessoas." },
    ],
    forbidden: [{ label: "Não recomendar clique", pattern: "return\\s+[\"']click[\"']", explanation: "A triagem não deve abrir o recurso suspeito." }],
    lines: [
      { code: "message.requestsSecret || message.domainMismatch", explanation: "Combina sinais fortes sem fingir que gramática ou logotipo provam legitimidade." },
      { code: "action: \"report\"", explanation: "Transforma suspeita em resposta organizacional." },
      { code: "confirmVia: \"official-channel\"", explanation: "Obriga confirmação em um canal previamente conhecido." },
      { code: "action: \"open-official-app\"", explanation: "Mesmo sem sinais fortes, o acesso parte do aplicativo oficial." },
    ],
    tests: ["Segredo nunca é enviado", "Domínio divergente gera reporte", "Confirmação não usa o link", "Fluxo sem sinal abre o app oficial"],
  },
  idor: {
    title: "Escreva autorização por recurso",
    summary: "Você liga o pedido ao usuário da sessão, nega por padrão e devolve apenas campos permitidos.",
    pieces: ["Filtrar pelo dono da sessão", "Negar quando o recurso não existe para aquela pessoa", "Montar uma resposta permitida"],
    functionName: "getOrder",
    signature: "async function getOrder(session, orderId) {",
    vulnerable: "async function getOrder(session, orderId) {\n  const order = await orders.findById(orderId)\n  return Response.json(order)\n}",
    solution: "async function getOrder(session, orderId) {\n  const order = await orders.findOne({\n    id: orderId,\n    userId: session.userId,\n  })\n  if (!order) return new Response(null, { status: 404 })\n  return Response.json({ id: order.id, item: order.item, status: order.status })\n}",
    rules: [
      { label: "Usar a identidade da sessão", pattern: "userId:\\s*session\\.userId", explanation: "O dono vem da sessão autenticada, não da URL." },
      { label: "Negar sem recurso autorizado", pattern: "if\\s*\\(!order\\)[\\s\\S]*status:\\s*404", explanation: "A ausência também cobre recurso de outra pessoa sem vazar detalhes." },
      { label: "Usar allowlist de campos", pattern: "Response\\.json\\(\\{\\s*id:\\s*order\\.id,\\s*item:\\s*order\\.item,\\s*status:\\s*order\\.status\\s*\\}\\)", explanation: "A resposta contém apenas o contrato público." },
    ],
    forbidden: [{ label: "Não buscar só pelo ID", pattern: "orders\\.findById\\(orderId\\)", explanation: "Identificador sozinho não representa autorização." }],
    lines: [
      { code: "userId: session.userId", explanation: "Inclui ownership na própria consulta." },
      { code: "if (!order)", explanation: "Nega por padrão quando a consulta autorizada não encontra resultado." },
      { code: "status: 404", explanation: "Evita devolver o recurso ou confirmar detalhes adicionais." },
      { code: "Response.json({ id: order.id", explanation: "Serializa somente campos explicitamente aprovados." },
    ],
    tests: ["Alice lê o pedido dela", "Alice não lê o pedido de Bruno", "Trocar ID não concede acesso", "Campos internos não saem no JSON"],
  },
  headers: {
    title: "Construa uma resposta HTTP mínima",
    summary: "Você começa pelo DTO, adiciona erro público e termina aplicando políticas ao navegador.",
    pieces: ["Selecionar campos públicos", "Separar erro público de log interno", "Adicionar headers de proteção"],
    functionName: "sendProfile",
    signature: "function sendProfile(res, user) {",
    vulnerable: "function sendProfile(res, user) {\n  res.setHeader(\"X-Powered-By\", \"Framework 1.0\")\n  return res.json(user)\n}",
    solution: "function sendProfile(res, user) {\n  res.removeHeader(\"X-Powered-By\")\n  res.setHeader(\"X-Content-Type-Options\", \"nosniff\")\n  res.setHeader(\"Content-Security-Policy\", \"default-src 'self'; frame-ancestors 'none'\")\n  return res.json({ id: user.id, name: user.name, email: user.email })\n}",
    rules: [
      { label: "Remover assinatura", pattern: "removeHeader\\([\"']X-Powered-By[\"']\\)", explanation: "Evita divulgar tecnologia sem necessidade." },
      { label: "Impedir sniffing", pattern: "X-Content-Type-Options[\"'],\\s*[\"']nosniff", explanation: "Pede ao navegador para respeitar o tipo declarado." },
      { label: "Definir CSP", pattern: "Content-Security-Policy", explanation: "Restringe origens e enquadramento conforme a política da aplicação." },
      { label: "Usar DTO", pattern: "res\\.json\\(\\{\\s*id:\\s*user\\.id,\\s*name:\\s*user\\.name,\\s*email:\\s*user\\.email\\s*\\}\\)", explanation: "Somente campos necessários atravessam a fronteira HTTP." },
    ],
    forbidden: [{ label: "Não serializar registro inteiro", pattern: "res\\.json\\(user\\)", explanation: "O registro pode conter hash, token e campos internos." }],
    lines: [
      { code: "res.removeHeader(\"X-Powered-By\")", explanation: "Retira uma assinatura desnecessária da resposta." },
      { code: "X-Content-Type-Options", explanation: "Adiciona uma política de interpretação de conteúdo." },
      { code: "Content-Security-Policy", explanation: "Limita recursos e ancestrais permitidos no navegador." },
      { code: "res.json({ id: user.id", explanation: "Constrói o corpo a partir de uma lista explícita." },
    ],
    tests: ["JSON não contém hash ou token", "Resposta não revela versão", "nosniff está presente", "CSP bloqueia framing externo"],
  },
  ssrf: {
    title: "Escreva uma política de destino SSRF",
    summary: "Você valida protocolo, resolução e redirects antes de permitir uma conexão simulada.",
    pieces: ["Aceitar apenas HTTPS", "Resolver e fixar um IP público", "Revalidar redirects e impor limites"],
    functionName: "preview",
    signature: "async function preview(rawUrl) {",
    vulnerable: "async function preview(rawUrl) {\n  return fetch(rawUrl)\n}",
    solution: "async function preview(rawUrl) {\n  const url = new URL(rawUrl)\n  if (url.protocol !== \"https:\") throw new Error(\"Destino recusado\")\n  const target = await policy.resolveAndPin(url)\n  return safeFetch(target, {\n    redirect: \"manual\",\n    timeoutMs: 2000,\n    maxBytes: 100000,\n  })\n}",
    rules: [
      { label: "Interpretar a URL", pattern: "new\\s+URL\\(rawUrl\\)", explanation: "A política trabalha com partes estruturadas, não palavras soltas." },
      { label: "Exigir HTTPS", pattern: "url\\.protocol\\s*!==\\s*[\"']https:[\"']", explanation: "Restringe o protocolo permitido pelo produto." },
      { label: "Resolver e fixar destino", pattern: "policy\\.resolveAndPin\\(url\\)", explanation: "A decisão acompanha o IP realmente usado na conexão." },
      { label: "Controlar redirects e recursos", pattern: "redirect:\\s*[\"']manual[\"'][\\s\\S]*timeoutMs:\\s*[\\s\\S]*maxBytes:\\s*", explanation: "Cada salto volta à política e a resposta tem tempo/tamanho limitados." },
    ],
    forbidden: [{ label: "Não buscar a entrada diretamente", pattern: "fetch\\(rawUrl\\)", explanation: "Isso entrega ao usuário a escolha do destino do servidor." }],
    lines: [
      { code: "const url = new URL(rawUrl)", explanation: "Interpreta o destino segundo a gramática de URL." },
      { code: "url.protocol !== \"https:\"", explanation: "Aplica a allowlist de protocolo." },
      { code: "policy.resolveAndPin(url)", explanation: "Valida e prende a conexão a um IP aprovado." },
      { code: "redirect: \"manual\"", explanation: "Impede seguir silenciosamente para outro destino." },
    ],
    tests: ["HTTPS público é permitido", "IP privado é bloqueado", "Redirect é revalidado", "Tempo e tamanho têm limite"],
  },
  upload: {
    title: "Escreva um pipeline seguro de upload",
    summary: "Você limita, decodifica, reprocessa, renomeia e só então publica.",
    pieces: ["Decodificar com limite", "Reprocessar os pixels", "Gerar nome e usar armazenamento isolado"],
    functionName: "saveAvatar",
    signature: "async function saveAvatar(file) {",
    vulnerable: "async function saveAvatar(file) {\n  return writeFile(\"public/uploads/\" + file.name, await file.bytes())\n}",
    solution: "async function saveAvatar(file) {\n  const image = await decodeWithLimit(file, { maxBytes: 2000000 })\n  const safeBytes = await encodePng(image)\n  const name = randomId() + \".png\"\n  await mediaStore.put(name, safeBytes, { contentType: \"image/png\" })\n  return { name }\n}",
    rules: [
      { label: "Decodificar com limite", pattern: "decodeWithLimit\\(file,\\s*\\{\\s*maxBytes:\\s*2000000\\s*\\}\\)", explanation: "O servidor limita recursos e prova que os bytes formam uma imagem." },
      { label: "Reprocessar conteúdo", pattern: "encodePng\\(image\\)", explanation: "A saída nova contém pixels decodificados, não os bytes originais." },
      { label: "Gerar nome", pattern: "randomId\\(\\)\\s*\\+\\s*[\"']\\.png[\"']", explanation: "O cliente não escolhe caminho nem nome final." },
      { label: "Publicar no mediaStore", pattern: "mediaStore\\.put\\(name,\\s*safeBytes", explanation: "O conteúdo seguro vai para uma origem dedicada." },
    ],
    forbidden: [{ label: "Não usar o nome enviado", pattern: "file\\.name", explanation: "O nome do cliente não deve virar caminho no servidor." }],
    lines: [
      { code: "decodeWithLimit(file", explanation: "Valida o conteúdo e limita o consumo de recursos." },
      { code: "encodePng(image)", explanation: "Cria novos bytes a partir da imagem decodificada." },
      { code: "randomId() + \".png\"", explanation: "Gera um nome controlado pelo servidor." },
      { code: "mediaStore.put(name, safeBytes", explanation: "Publica somente a versão reprocessada no armazenamento de mídia." },
    ],
    tests: ["Imagem válida é reprocessada", "HTML com nome PNG é recusado", "Nome com ../ é ignorado", "Arquivo grande é interrompido"],
  },
};

function levelRules(curriculum: Curriculum, count: number) {
  return curriculum.rules.slice(0, count);
}

function starterFor(curriculum: Curriculum, count: number) {
  const retained = curriculum.vulnerable.split("\n").slice(1, -1);
  const guidance = count === 1
    ? ["  // ESCREVA A PRIMEIRA PROTEÇÃO AQUI", ...retained]
    : ["  // MANTENHA A PROTEÇÃO ANTERIOR E ACRESCENTE A PRÓXIMA", ...retained];
  return [curriculum.signature, ...guidance, "}"].join("\n");
}

function hintsFor(curriculum: Curriculum, count: number): [string, string, string] {
  const rules = curriculum.rules.slice(0, count);
  return [
    `Conceito: ${rules[0].explanation}`,
    `Localização: trabalhe dentro de ${curriculum.functionName}, antes do retorno vulnerável. Não altere o nome da função nem os parâmetros.`,
    `Forma esperada: use estas peças na ordem do fluxo: ${rules.map((rule) => rule.label).join(" → ")}.`,
  ];
}

function stepsFor(curriculum: Curriculum, count: number) {
  return curriculum.rules.slice(0, count).map((rule, index) => `${index + 1}. ${rule.label}. ${rule.explanation}`);
}

function explainSolution(curriculum: Curriculum) {
  const solutionLines = curriculum.solution.split("\n");
  return solutionLines.map((code, index) => {
    const trimmed = code.trim();
    const specific = curriculum.lines.find((item) =>
      trimmed === item.code.trim() || trimmed.includes(item.code.trim()),
    );
    let explanation = specific?.explanation;
    if (!explanation && index === 0) {
      explanation = `Declara ${curriculum.functionName}. Os nomes entre parênteses são os valores e serviços entregues à função.`;
    } else if (!explanation && trimmed === "}") {
      explanation = "Fecha o bloco aberto anteriormente. O código dentro das chaves pertence àquela função ou condição.";
    } else if (!explanation && trimmed.endsWith("{")) {
      explanation = "Abre um bloco. As próximas linhas só pertencem a este caminho enquanto permanecem dentro das chaves.";
    } else if (!explanation && trimmed === "return") {
      explanation = "Encerra este caminho para impedir que a função continue até uma operação posterior.";
    } else if (!explanation && trimmed.startsWith("return ")) {
      explanation = "Encerra a função e entrega este resultado ao código que a chamou.";
    } else if (!explanation && trimmed.startsWith("const ")) {
      explanation = "Cria um nome local para guardar o resultado desta operação e usá-lo nas próximas linhas.";
    } else if (!explanation && trimmed.startsWith("await ")) {
      explanation = "Espera a operação assíncrona terminar antes de continuar, preservando a ordem das verificações.";
    } else if (!explanation && trimmed.length === 0) {
      explanation = "Linha em branco usada apenas para separar visualmente as etapas.";
    } else {
      explanation = "Esta linha conecta as etapas da função de referência e mantém a ordem necessária do fluxo.";
    }
    return { line: index + 1, code: code || " ", explanation };
  });
}

function makeLevels(curriculum: Curriculum): [CodeLevel, CodeLevel, CodeLevel, CodeLevel] {
  const ruleCounts = [Math.min(1, curriculum.rules.length), Math.min(3, curriculum.rules.length), curriculum.rules.length];
  const explainedLines = explainSolution(curriculum);
  return [
    {
      id: "piece", title: `Nível 1 · ${curriculum.rules[0].label}`,
      context: "Você não precisa inventar a função. Leia a anatomia acima e escreva somente a primeira proteção no ponto marcado.",
      task: `Dentro de ${curriculum.functionName}, implemente: ${curriculum.rules[0].label.toLocaleLowerCase("pt-BR")}.`,
      steps: stepsFor(curriculum, ruleCounts[0]), hints: hintsFor(curriculum, ruleCounts[0]), starter: starterFor(curriculum, 1), solution: curriculum.solution,
      required: levelRules(curriculum, ruleCounts[0]), forbidden: curriculum.forbidden, lines: explainedLines,
    },
    {
      id: "extend", title: `Nível 2 · ${curriculum.pieces[1]}`,
      context: "Agora repita a primeira proteção e acrescente as próximas. O objetivo é entender como as barreiras se conectam.",
      task: curriculum.rules.slice(0, ruleCounts[1]).map((rule) => rule.label).join(" + "),
      steps: stepsFor(curriculum, ruleCounts[1]), hints: hintsFor(curriculum, ruleCounts[1]), starter: starterFor(curriculum, 2), solution: curriculum.solution,
      required: levelRules(curriculum, ruleCounts[1]), forbidden: curriculum.forbidden, lines: explainedLines,
    },
    {
      id: "complete", title: `Nível 3 · ${curriculum.pieces[2]}`,
      context: "Reconstrua a função inteira usando as peças que você já treinou. A lista abaixo fornece a ordem e o motivo de cada parte.",
      task: `Completar ${curriculum.functionName} com todas as fronteiras`,
      steps: stepsFor(curriculum, curriculum.rules.length), hints: hintsFor(curriculum, curriculum.rules.length), starter: `${curriculum.signature}\n  // RECONSTRUA AQUI AS PEÇAS DOS NÍVEIS ANTERIORES\n}`, solution: curriculum.solution,
      required: curriculum.rules, forbidden: curriculum.forbidden, lines: explainedLines,
    },
    {
      id: "review", title: "Nível 4 · Revisão profissional",
      context: "Compare o código vulnerável com o objetivo seguro, corrija-o e use o painel linha a linha para explicar o mecanismo.",
      task: "Restaurar a solução esperada e relacionar cada linha ao seu papel",
      steps: stepsFor(curriculum, curriculum.rules.length), hints: hintsFor(curriculum, curriculum.rules.length), starter: curriculum.vulnerable, solution: curriculum.solution,
      required: curriculum.rules, forbidden: curriculum.forbidden, lines: explainedLines,
    },
  ];
}

function signatureAnatomy(signature: string) {
  const match = signature.match(/function\s+(\w+)\(([^)]*)\)/);
  const names = match?.[2].split(",").map((name) => name.trim()).filter(Boolean) ?? [];
  return [
    { name: match?.[1] ?? "função", role: "bloco chamado pelo servidor para realizar esta tarefa" },
    ...names.map((name) => ({ name, role: `valor ou serviço que o servidor entrega à função; aqui ele se chama ${name}` })),
  ];
}

function exampleCallFor(signature: string) {
  const match = signature.match(/function\s+(\w+)\(([^)]*)\)/);
  const values = match?.[2].split(",").map((name) => name.trim()).filter(Boolean).map((name) => `<${name}>`) ?? [];
  return `${match?.[1] ?? "funcao"}(${values.join(", ")})`;
}

export const SECURITY_CODE_PRACTICES = Object.fromEntries(
  SECURITY_TOPICS.map((topic) => {
    const curriculum = CURRICULA[topic];
    return [topic, {
      title: curriculum.title,
      summary: curriculum.summary,
      language: curriculum.language ?? "javascript",
      anatomy: curriculum.anatomy ?? signatureAnatomy(curriculum.signature),
      exampleCall: curriculum.exampleCall ?? exampleCallFor(curriculum.signature),
      levels: makeLevels(curriculum),
      tests: curriculum.tests,
    } satisfies CodePractice];
  }),
) as Record<SecurityTopic, CodePractice>;

export type RuleResult = { label: string; ok: boolean; explanation: string };

export function inspectCode(source: string, level: CodeLevel): RuleResult[] {
  const clean = stripComments(source).slice(0, 12000);
  return [
    ...level.required.map((rule) => ({ label: rule.label, ok: new RegExp(rule.pattern, "i").test(clean), explanation: rule.explanation })),
    ...(level.forbidden ?? []).map((rule) => ({ label: rule.label, ok: !new RegExp(rule.pattern, "i").test(clean), explanation: rule.explanation })),
  ];
}

function stripComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}
