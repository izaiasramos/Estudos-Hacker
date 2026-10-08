# SPEC — Trilha Gamificada de Segurança para Devs

**Produto (nome provisório):** ShieldPath  
**Versão:** 0.16  
**Data:** 2026-10-07  
**Status:** produção em https://estudos-hacker.vercel.app com Postgres no Supabase. Trilhas, quiz, lab embutido, progresso e squad compartilhados.  
**Público:** desenvolvedores júnior que querem entender ataques para proteger sistemas

---

## 1. Visão

Criar uma plataforma web em que um dev júnior se cadastra, percorre trilhas temáticas (SQL Injection, phishing, sequestro de sessão, etc.) e sai de cada trilha com três coisas concretas:

1. Entendeu **o que** o atacante explora e **por que** aquilo funciona.
2. Praticou o problema em um **laboratório isolado**, sem atacar sistemas reais.
3. Implementou a **defesa** no mesmo laboratório e conseguiu provar que o ataque deixou de funcionar.

O produto não é um curso passivo e não é um CTF solto. É uma trilha guiada: contexto → teoria curta → quiz → exercícios graduais → laboratório ofensivo controlado → laboratório defensivo → selo de especialidade.

**Frase-guia:** *saber como se ataca para saber como se protege — sempre em ambiente próprio, isolado e ético.*

---

## 2. Problema que resolvemos

Devs júnior costumam:

- ouvir nomes de ataques sem conseguir visualizar o fluxo real;
- copiar “fixes” sem entender o que estava quebrado;
- não ter um lugar seguro para errar e repetir;
- misturar conteúdo ofensivo solto da internet com o trabalho do dia a dia, sem método nem ética.

O mercado já tem TryHackMe, PortSwigger Academy, OWASP Juice Shop e similares. ShieldPath se diferencia por ser **feito para o fluxo mental de quem programa**: cada trilha termina com o aluno **corrigindo código**, não só “capturando a flag”.

---

## 3. Objetivos de produto

### 3.1 Objetivos de aprendizado (aluno)

Ao concluir uma trilha, o aluno deve ser capaz de:

- explicar o ataque em linguagem simples para outro júnior;
- reconhecer o sintoma no código e no comportamento da aplicação;
- reproduzir o cenário **apenas** no laboratório da plataforma;
- aplicar a mitigação correta e justificar por que ela funciona;
- listar o que **não** deve ser feito fora do laboratório.

### 3.2 Objetivos de negócio (time)

- ter um currículo compartilhado para o grupo estudar junto;
- medir progresso (não só “assisti o vídeo”);
- evoluir o produto módulo a módulo, começando por SQL Injection;
- manter a plataforma legalmente e eticamente sustentável.

---

## 4. Princípios não-negociáveis

Estes princípios entram na spec porque o produto lida com técnicas ofensivas.

1. **Alvo único permitido:** aplicações de laboratório provisionadas pela plataforma, em rede isolada. Nunca sites, APIs ou contas de terceiros.
2. **Ética primeiro:** a primeira unidade obrigatória de toda conta nova é “Regras do jogo” (legal, ética, responsabilidade). Sem concluir, o aluno não destrava laboratórios.
3. **Defesa é o destino:** o selo da trilha só é emitido depois do laboratório defensivo, não depois do ofensivo.
4. **Sem receita pronta de ataque no conteúdo público:** teoria explica *o que* e *por que*; o *como* operacional fica dentro do lab isolado, com alvos fictícios.
5. **Sem coleta de credenciais reais de terceiros:** phishing é ensinado com simulações internas (e-mail falso da própria plataforma, vítima fictícia).
6. **Logs de lab são de aprendizado, não de punição:** o aluno pode falhar e repetir.
7. **Conteúdo em português**, com termos técnicos em inglês quando for o padrão da indústria (ex.: `session fixation`, `CSRF`).
8. **A interface prende pela clareza e pela recompensa, não pelo ruído.** Efeito visual existe para marcar progresso, estado e o próximo passo. Se o movimento atrasar a leitura ou o CTA, ele sai.

---

## 5. Personas

| Persona | Necessidade | Medo | Sucesso |
|---|---|---|---|
| **Júnior curioso** | entender ataques que só viu em meme/notícia | “vou quebrar algo de verdade” | completar 1 trilha e explicar no daily |
| **Júnior de produto** | proteger a API/CRUD que já faz no trabalho | parecer inseguro pedindo ajuda | aplicar 1 mitigação no projeto real *depois* do lab |
| **Mentor / colega mais velho** | ter material padronizado para o grupo | conteúdo irresponsável | acompanhar progresso do time no painel |

Escopo inicial era o aluno sozinho. No time, todo mundo vê nota, tentativas, ranking de cada trilha e ranking geral.

---

## 6. Proposta pedagógica

### 6.1 Ciclo de cada trilha (obrigatório)

Toda trilha segue o mesmo arco. Isso é o “motor” do produto e deve ser memorizável.

```
0. Regras e contexto ético da trilha
1. Contexto (história + impacto no mundo real, sem tutorial de ataque)
2. Teoria interativa (blocos curtos, 3–8 min cada)
3. Vídeo opcional (≤ 5 min, YouTube embutido, lista branca)
4. Quiz de validação (3–6 questões)
5. Exercícios guiados (identificar, classificar, completar lacunas)
6. Laboratório ofensivo controlado (reproduzir o problema no app vulnerável)
7. Debrief (o que aconteceu, qual invariante quebrou)
8. Teoria de defesa
9. Laboratório defensivo (corrigir o app e re-testar)
10. Checkpoint final + selo da especialidade
```

O aluno **não escolhe pular** do 2 para o 6 no MVP. Liberação é sequencial. Depois do MVP, um modo “revisão livre” pode reabrir labs já concluídos.

### 6.2 Níveis de prática (dentro da mesma trilha)

Para “memorizar o passo a passo” sem virar um dump de exploit:

| Nível | Nome | O que o aluno faz | O que o sistema avalia |
|---|---|---|---|
| L1 | Reconhecer | aponta onde o defeito mora (input, cookie, e-mail, token) | escolha correta + justificativa curta |
| L2 | Explicar | ordena o fluxo do ataque em cartões | ordem correta do fluxo |
| L3 | Diagnosticar | recebe um sintoma (erro, comportamento) e escolhe a hipótese | hipótese + evidência |
| L4 | Reproduzir no lab | usa o app vulnerável isolado até atingir um objetivo didático (“login como vítima fictícia”, “ler registro autorizado no lab”) | checker automático do lab |
| L5 | Corrigir | aplica o patch no código do lab | testes de regressão + teste de segurança passam |
| L6 | Ensinar | responde 1 pergunta aberta: “como você explicaria isso a um júnior?” | rubrica simples / revisão entre pares (pós-MVP) |

L4 e L5 acontecem em containers efêmeros. O aluno nunca aponta a ferramenta para a internet aberta.

### 6.3 O que “mão na massa” significa aqui

- **Ofensivo:** o aluno interage com um app de laboratório propositalmente vulnerável (estilo OWASP Juice Shop / DVWA), com dados fictícios.
- **Defensivo:** o aluno edita o código desse mesmo app (ou um recorte dele) até os testes da plataforma confirmarem que o vetor foi fechado e a feature continua funcionando.

Não faz parte do MVP: varrer IPs, phishing de pessoas reais, keyloggers, malware, engenharia reversa de software de terceiros.

---

## 7. Escopo funcional

### 7.1 MVP (v1) — deve caber em um time júnior

**Conta e acesso**

- Cadastro com e-mail + senha.
- Login com Google (OAuth).
- Logout, recuperação de senha, exclusão de conta.
- Termo de uso + aceite das regras éticas (gate).

**Aprendizado**

- Home com trilha em progresso, próxima aula, selos.
- 1 trilha completa: **SQL Injection (especialidade)**.
- Player de conteúdo: texto interativo (callouts, tabs “errado vs certo”, glossário).
- Embed de YouTube com vídeos curados (≤ 5 min), fallback se o embed falhar: link + resumo textual.
- Quiz com feedback imediato (certo/errado + por que).
- Exercícios L1–L3.
- Lab L4 (app vulnerável isolado) + Lab L5 (mesmo app para patch).
- Progresso persistido: aula, quiz, exercício, lab.
- Selo “Especialista em SQL Injection” ao concluir L5 + checkpoint.

**Plataforma**

- Layout responsivo (desktop-first, usável no notebook).
- Idioma: pt-BR.
- Admin mínimo: marcar conteúdo publicado / rascunho (pode ser arquivo versionado no repo no MVP, sem CMS).

**Fora do MVP**

- Mentor dashboard, fórum, certificado PDF, ranking público tóxico, marketplace de trilhas, app mobile, múltiplos idiomas, IA gerando exploits, laboratórios contra alvos externos.

### 7.2 v1.1 — segunda leva de trilhas

Ordem sugerida (do mais comum no dia a dia do dev web para o mais amplo):

1. SQL Injection *(MVP)*
2. Autenticação quebrada e senhas
3. Sequestro / fixação de sessão
4. XSS (refletido e armazenado) — base para vários outros
5. CSRF
6. Phishing e engenharia social *(simulação interna)*
7. Controle de acesso (IDOR / Broken Access Control)
8. Exposição de dados e headers de segurança
9. SSRF e upload inseguro *(depois, mais avançado)*

Cada trilha nova reutiliza o mesmo motor pedagógico. Não reinventar UX por tema.

---

## 8. Currículo da trilha piloto: SQL Injection

A spec da trilha piloto serve de **template** para todas as outras.

### 8.1 Resultado esperado

O aluno explica, com as próprias palavras:

- dado não confiável entrou em uma consulta;
- a consulta deixou de ser dado e passou a ser instrução;
- o banco executou a intenção do atacante;
- a defesa correta é **separar dado de instrução** (consultas parametrizadas / ORM seguro) + menor privilégio + validação como camada extra.

### 8.2 Unidades

| # | Unidade | Formato | Critério de saída |
|---|---|---|---|
| 0 | Contrato ético da trilha | texto + aceite | checkbox + 2 questões |
| 1 | O que é um banco e uma query no app web | texto interativo | quiz 3 itens |
| 2 | Onde o input do usuário encontra o SQL | diagrama + texto | exercício L1 |
| 3 | Por que concatenar string quebra a invariante | texto + analogia | quiz |
| 4 | Sintomas que um dev vê (erro 500, login estranho, dado vazando no lab) | casos | exercício L3 |
| 5 | Tipos: in-band, blind, second-order *(conceitual)* | texto curto | quiz |
| 6 | Lab ofensivo: login e listagem vulneráveis | lab isolado | objetivo didático do checker |
| 7 | Debrief: o que o banco realmente executou | texto + reconstituição | 1 questão aberta curta |
| 8 | Defesas: parameterized queries, least privilege, WAF como rede de proteção (não como única defesa) | texto | quiz |
| 9 | Lab defensivo: aplicar patch e ver o ataque falhar | lab + testes | suite verde |
| 10 | Checkpoint + selo | misto | nota mínima |

### 8.3 Laboratório piloto (requisitos)

O lab de SQLi é um **mini-app** (login + lista de “pedidos” fictícios), com duas versões:

- `vulnerable`: código propositalmente inseguro.
- `student`: fork do aluno, começa vulnerável; a tarefa é endurecer.

Regras do lab:

- roda em container por aluno, TTL curto (ex.: 60–90 min), rede sem saída para a internet;
- dados 100% fictícios (`alice@lab.local`, pedidos de pizza);
- checker verifica *comportamento* (ex.: “após o patch, login só autentica com credencial válida do lab” e “listagem não devolve pedidos de outro usuário”);
- o enunciado descreve o **objetivo de aprendizado** e os **sintomas**, não um playbook de exploração para copiar e colar em produção.

### 8.4 Quiz — regras de qualidade

- 3 a 6 questões por unidade.
- Mistura: múltipla escolha, verdadeiro/falso com justificativa, “qual linha está perigosa?”.
- Toda resposta errada explica o porquê em 1–3 frases.
- Nota mínima para avançar: 70%. Reintento ilimitado, com embaralhamento.
- Proibido: pergunta que só cobra memorizar payload.

---

## 9. Outras trilhas (contrato de conteúdo)

Cada trilha futura deve caber neste contrato, para o time não improvisar.

### 9.1 Sequestro de sessão (v1.1)

Ensinar, em alto nível:

- cookie de sessão é uma chave de identidade temporária;
- se vazar (XSS, cookie sem flags, tráfego sem HTTPS, session fixation), o servidor passa a tratar o atacante como o usuário;
- defesa: `HttpOnly`, `Secure`, `SameSite`, rotação de sessão no login, timeout, invalidação no logout, não colocar token em `localStorage` sem entendimento do risco.

Lab entregue: a Pizzaria do Lab mostra `sessao=chave-da-alice` sem marcas. O aluno liga HttpOnly, Secure, SameSite Lax ou Strict, troca da chave no login e apagar no logout. O checker só aceita quando as cinco estão presentes. Não há passo de roubar a chave.

### 9.2 Phishing (v1.1)

Ensinar:

- o alvo é a pessoa, não o SQL;
- sinais de mensagem urgente, URL lookalike, pedido de senha, anexo;
- no produto: o aluno analisa e-mails fictícios da caixa de entrada do lab e classifica (legítimo / suspeito / phishing);
- depois constrói defesas de produto: não pedir senha por e-mail, magic link com cuidado, 2FA, aviso de login novo, treinamento da equipe.

**Proibido no produto:** templates para atacar pessoas reais, páginas clones de bancos/Google, kits de phishing, captura de senha de terceiros.

### 9.3 XSS, CSRF, IDOR

Mesmo arco. Sempre: invariante quebrada → sintoma → lab isolado → patch → selo.

---

## 10. Gamificação (leve, não infantil)

Objetivo da gamificação: **ritmo e memória**, não ranking tóxico.

| Elemento | Comportamento | MVP? |
|---|---|---|
| Trilha visual (nós 0–10) | mapa da especialidade | sim |
| XP por unidade | +10 teoria, +15 quiz, +25 exercício, +40 lab, +60 selo | sim |
| Nível de conta | Jr → Pleno defensivo → Especialista (global, soma de selos) | sim |
| Selo por trilha | badge + data + critérios | sim |
| Streak de estudo | dias consecutivos com ≥ 1 unidade, no fuso de São Paulo. Um dia sem unidade zera a sequência na tela | entregue na fase 4 |
| “Squad” do time | nota média, tentativas, ranking de cada trilha e ranking geral, visíveis para quem está no time | entregue na fase 4 |
| Ranking aberto fora do time | — | não |
| Vidas / punição | — | não |

Copy da UI: profissional, direto, sem “você é um hacker elite”. Preferir “você fechou o vetor” / “você defendeu o login”.

---

## 11. Autenticação e contas

### 11.1 Métodos

- **E-mail + senha:** senha com política mínima (tamanho, não comum); hash com algoritmo moderno (Argon2id ou bcrypt); verificação de e-mail.
- **Google OAuth 2.0:** criar conta na primeira autorização; vincular e-mail Google se já existir conta local com o mesmo e-mail (fluxo explícito de vínculo, sem fusão silenciosa perigosa).
- Sessão: cookie httpOnly + secure + sameSite; CSRF protection nas rotas de mutação.
- A própria plataforma deve ser vitrine das defesas que ensina.

**Andamento:** e-mail e senha já entram com bcrypt e cookie httpOnly. O Google está no código e só liga quando `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` existem; sem isso o botão avisa. Se o e-mail do Google já tiver conta local, as contas não se fundem sozinhas. Verificação de e-mail espera um SMTP.

### 11.2 Perfil

- Nome de exibição, avatar (Gravatar ou inicial).
- Trilhas, XP, selos, data do último lab.
- Preferência: reduzir movimento / modo compacto (acessibilidade básica).

### 11.3 Papéis

| Papel | Pode |
|---|---|
| `learner` | estudar, fazer labs, ver próprio progresso |
| `admin` | publicar conteúdo, ver métricas agregadas, derrubar lab zumbi |
| `mentor` (v1.1) | abre e encerra o time. O ranking, a nota e as tentativas são os mesmos para todo o grupo |

---

## 12. Arquitetura (visão)

```
[Browser]
    | HTTPS
[App Web — Next.js ou similar]
    | session cookie
[API — mesmo monólito no MVP]
    |
    +-- Postgres (usuários, progresso, conteúdo)
    +-- Object/CDN (imagens, se necessário)
    +-- YouTube embed (terceiro)
    +-- Lab Orchestrator
            |
            +-- runtime isolado (Docker)
                  - 1 container (ou compose) por sessão de lab
                  - rede interna only
                  - cota de CPU/RAM
                  - timeout + destroy
                  - checker (testes HTTP + testes de unidade no repo do aluno)
```

### 12.1 Decisões do MVP

- **Monólito** web + API para o time ir mais rápido.
- Conteúdo das aulas em **MDX/Markdown versionado no Git** (revisão em PR, sem CMS no começo).
- Labs: imagens Docker pré-buildadas (`sqli-vuln`, `sqli-student`).
- Orquestração: começar com **1 lab por vez por aluno** e um worker simples. Kubernetes só se a dor aparecer.
- Segredos: nunca no front; `.env` fora do Git.
- **Banco:** PostgreSQL. No computador do grupo, `docker compose up -d` sobe o banco em `localhost:5432`. O SQLite antigo em `data/shieldpath.db` só serve de origem para `npm run db:import`.

### 12.2 Isolamento do lab (requisito de segurança do produto)

O produto ensina ataque; o lab **não pode** virar pivot para a máquina do aluno, para a API da plataforma ou para a internet.

Mínimo aceitável:

- container sem privilégio, filesystem read-only onde possível;
- sem Docker socket montado;
- sem acesso à rede da API de produção;
- egress bloqueado;
- recursos limitados;
- destruição automática;
- enunciados e checkers não executam código arbitrário enviado pelo aluno no host.

Editor de código do lab L5: no MVP, pode ser **Web IDE embutido** (ex.: recorte de 1–3 arquivos) ou download do repo + upload do patch. Preferência: editor no browser para reduzir atrito.

### 12.3 Laboratório da pizzaria (modo embutido)

Por padrão, a Pizzaria do Lab roda **dentro do próprio Next.js**, em `/lab/pizzaria`. O iframe da trilha aponta para esse caminho no mesmo domínio. Funciona na Vercel e no `npm run dev`, sem Docker.

Fluxo:

1. O aluno clica em **Iniciar ambiente** na unidade 6.
2. O servidor grava `lab_sessions` com `runtime = embedded`.
3. O iframe abre `/lab/pizzaria`. Login e pedidos usam rotas em `/lab/pizzaria/login` e `/lab/pizzaria/pedidos`.
4. A sessão da pizzaria fica num cookie httpOnly amarrado ao `lab_sessions.id` do aluno.
5. **Rodar checker HTTP** valida o comportamento esperado (Alice entra, senha errada cai, pedidos só dela).

Contas fictícias continuam em `labs/pizzaria/fixture.json`. O arquivo `labs/pizzaria/server.mjs` permanece para o modo legado.

#### Modo legado (`LAB_RUNTIME=local`)

Se `LAB_RUNTIME=local` no `.env`, o orquestrador tenta Docker e, se falhar, um processo Node em `127.0.0.1`. O iframe volta a apontar para a porta local. Esse modo exige Docker na máquina e **não** funciona na Vercel. Serve para quem quiser o container isolado descrito em 12.2.

| Parte | Vercel / padrão | `LAB_RUNTIME=local` |
| --- | --- | --- |
| Pizzaria no iframe | `/lab/pizzaria` | `http://127.0.0.1:{porta}/` |
| Docker | não usa | opcional |
| Lab defensivo (editor) | sim | sim |

---

## 13. Modelo de dados (mínimo)

Entidades principais:

- `User` — id, email, provider (`local` \| `google`), hash, nome, role, createdAt, ethicsAcceptedAt
- `Trail` — slug, título, ordem, publicado
- `Unit` — trailId, ordem, tipo (`ethics`, `theory`, `video`, `quiz`, `exercise`, `lab_offense`, `debrief`, `lab_defense`, `checkpoint`)
- `ContentBlock` — unitId, MDX / metadados do vídeo (youtubeId, duração)
- `Question` / `Choice` — quiz e exercícios
- `Progress` — userId, unitId, status (`locked`, `available`, `done`), score, attempts
- `LabSession` — userId, unitId, containerId, status, startedAt, expiresAt
- `Badge` / `UserBadge`
- `XpEvent`

Regras:

- uma unidade `available` só se a anterior da mesma trilha está `done` (exceto revisão pós-selo);
- selo exige `lab_defense` + `checkpoint` `done`.

---

## 14. Fluxos principais

### 14.1 Primeiro acesso

1. Landing explica o propósito defensivo e o contrato ético.
2. Cadastro (Google ou e-mail).
3. Aceite dos termos + unidade 0 global “Regras do jogo”.
4. Home: CTA único — “Começar SQL Injection”.

### 14.2 Estudar uma unidade teórica

1. Ler blocos interativos.
2. (Opcional) assistir vídeo ≤ 5 min.
3. Quiz. Se < 70%, feedback e retentativa.
4. Unidade seguinte destrava. XP creditado uma vez (retentativa não farmar XP no MVP).

### 14.3 Laboratório

1. Aluno clica “Iniciar lab”.
2. Orquestrador sobe o ambiente e devolve URL interna + instruções.
3. Aluno trabalha até o checker passar **ou** o TTL expirar.
4. “Encerrar lab” destrói o ambiente.
5. Sucesso persiste progresso; falha mantém a unidade `available`.

### 14.4 Selo

1. Checkpoint final (mistura teoria + 1 pergunta de defesa).
2. Emissão do badge na home e no perfil.
3. CTA: “Próxima trilha” (bloqueada até existir) ou “Revisar lab”.

---

## 15. Interface — direção visual

A v0.1 descrevia telas. Esta seção define **como a interface prende**. Tailwind é a base: utilitários para layout, tokens para cor e tipo, e uma camada pequena de motion por cima. O visual não é um tema de “terminal hacker”. É uma sala de comando escura, precisa, com um único acento elétrico e um mapa de trilha que acende conforme o aluno avança.

O “uau” mora em três momentos, não na página inteira piscando:

1. **Entrada** — a landing desenha a trilha sozinha e o CTA aparece no fim do traço.
2. **Progresso** — cada unidade concluída acende o próximo nó; a luz corre pela aresta.
3. **Selo** — o badge monta na tela quando a defesa passa, com nome da especialidade e data.

### 15.1 Princípios de tela

1. **O próximo passo é o elemento mais brilhante da página.** Um CTA primário por vista.
2. **Movimento explica estado.** Nó bloqueado está quieto e opaco. Nó atual pulsa devagar. Nó concluído fica aceso e parado.
3. **Recompensa no instante certo.** Quiz certo, teste verde e selo têm feedback tátil. Texto teórico não dança.
4. **Densidade de ferramenta, não de marketing.** Tipografia grande no herói; no player, leitura confortável e pouco chrome.
5. **`prefers-reduced-motion` é obrigatório.** Quem pede menos movimento vê o mesmo layout, sem traço animado, sem pulso, sem cerimônia longa. O estado (feito / atual / bloqueado) continua óbvio por cor, ícone e texto.

### 15.2 Linguagem visual

| Token | Valor de partida | Uso |
|---|---|---|
| Fundo | `#07080d` com véu radial sutil | app inteira, dark-first |
| Superfície | `#12141c` / borda `white/10` | cards, player, painel do lab |
| Texto | `#f4f1ea` e secundário `#a8a49b` | leitura longa sem cinza morto |
| Acento | `#d6ff4a` (lima) | CTA, nó atual, “defesa ok” |
| Perigo didático | `#ff5c39` | buraco ainda aberto, erro de quiz |
| Defesa | `#3ee0b0` | teste verde, vetor fechado |
| Fonte de UI | uma sans geométrica (ex.: Geist ou Instrument Sans) | títulos e interface |
| Fonte de código | JetBrains Mono ou Geist Mono | snippets, lab, timer |
| Raio | 16px cards, 999px pills | consistente |
| Sombra | glow do acento só no CTA e no nó ativo | o resto é borda, não neon |

Clima: papel escuro, lima de marcador, laranja só quando algo ainda está vulnerável. Sem chuva de matrix, sem caveira, sem verde-fósforo em tudo, sem som automático.

### 15.3 Stack de UI

- **Tailwind CSS** para layout, espaçamento, cor e estados (`hover`, `focus-visible`, `data-state`).
- **Tokens em CSS variables** consumidos pelo Tailwind, para o acento e o fundo não ficarem espalhados em classes soltas.
- **Motion** (biblioteca `motion`) para a trilha, a cerimônia do selo e transições de rota. Microinteração de botão fica em CSS (`transition`, `active:scale-[0.98]`).
- Componentes próprios. Sem copiar um dashboard genérico de template.

Orçamento de motion na landing e na home: animações de entrada somam no máximo ~1,2 s até o CTA estar clicável. O conteúdo de aula não espera animação para ser lido.

### 15.4 Efeitos que entram no MVP

| Momento | Efeito | Por que prende |
|---|---|---|
| Landing | malha de gradiente lenta + SVG da trilha desenhando o caminho | a pessoa vê o produto antes de ler o parágrafo |
| CTA | borda que segue o ponteiro (glow curto) + seta que avança 4px no hover | o botão parece vivo, sem distrair o texto |
| Home | mapa de nós; ao concluir, um traço de luz percorre a aresta até o próximo | progresso vira imagem, não só porcentagem |
| Nó atual | anel pulsando em 2,4 s | “é aqui que você está” sem badge gritando |
| Quiz certo | card assenta (scale 1 → 0.99 → 1) e a borda vira lima | acerto tem peso |
| Quiz errado | shake horizontal de 6px, uma vez, + explicação já visível | erro é informação, não punição |
| Boot do lab | 3 etapas nomeadas (“isolando rede”, “subindo app”, “pronto”) com barra real, não terminal falso | a espera de até 45 s vira ritual, não spinner morto |
| Testes do L5 | cada teste acende em sequência; o último, se verde, dispara “vetor fechado” | o aluno vê a defesa acontecer |
| Selo | badge entra em 3 peças (anel, ícone, nome) em ~900 ms e fica no perfil | fim de trilha merece cena curta |

Fora do MVP: cursor custom gigante, partículas no mouse, tilt 3D em todo card, áudio, WebGL pesado. Se sobrar fôlego depois do selo funcionar, um único canvas na landing (trilha em perspectiva) pode entrar — nunca no player de leitura.

### 15.5 Landing

Primeira dobra, em uma frase visual e uma frase escrita:

- Título: “Feche o buraco que você acabou de entender.”
- Subtítulo: “Aprenda o ataque no laboratório. Defenda no código. Saia com o selo.”
- Trilha SVG animada ao lado ou atrás do título, com 4 nós legíveis: Ética → SQL Injection → Defesa → Selo.
- CTA primário: “Criar conta”. Secundário: “Entrar com Google”.
- Linha curta do contrato: uso só em laboratório próprio. Sem seção longa de “não somos um curso para invadir” competindo com o herói; isso fica num bloco abaixo, em texto normal.
- Prova do método em 3 cards que entram em sequência: teoria curta, lab isolado, patch com teste verde.
- Rodapé com termo e ética.

### 15.6 Home logada

- Faixa superior fina: nome, XP, nível. Sem dashboard de 12 gráficos.
- Bloco dominante: “Continuar — Unidade N · SQL Injection”, com o mapa da trilha ocupando a maior área.
- Nós concluídos acesos, atual com pulso, futuros com cadeado e rótulo.
- Se houver lab ligado: banner fixo lima, “Ambiente ativo · encerrar”, com o tempo restante.
- Selos já ganhos numa fileira horizontal; o próximo selo aparece vazado (contorno), para a meta ficar visível.

### 15.7 Player de aula

- Índice da trilha fixo à esquerda no desktop (nós pequenos). No notebook estreito, vira uma barra superior compacta.
- Coluna de leitura com medida ~68ch. Fundo da coluna um tom acima do app, para o olho descansar.
- Callouts com ícone e borda, sem animação de loop: `Conceito`, `Analogia`, `Armadilha comum`, `Como um dev vê isso`.
- Termos do glossário com sublinhado pontilhado; o painel abre no hover e no foco, não só no mouse.
- Vídeo ≤ 5 min depois do texto mínimo, em card com borda. Se o embed falhar, o resumo ocupa o mesmo lugar.
- Barra inferior persistente: “Marcar como lida” / “Ir ao quiz”, sempre alcançável.

### 15.8 Lab

- Split: à esquerda, objetivo, restrições, timer e “Encerrar lab”. À direita, o app alvo.
- No L5, a direita vira editor + saída dos testes.
- Timer legível, mono, sem piscar até os últimos 5 minutos (aí o dígito vai para o laranja).
- Nunca um terminal irrestrito no host. A “cara de terminal” fica restrita ao log curto do boot.

### 15.9 Acessibilidade e performance

- Contraste do texto principal ≥ 4.5:1. Acento lima em texto pequeno só sobre fundo escuro verificado; se falhar, o texto do CTA fica em `#07080d` sobre o botão lima.
- Foco visível em todo controle (`focus-visible:ring`).
- Estado nunca depende só de cor: ícone + rótulo (“concluída”, “agora”, “bloqueada”).
- Vídeos com legenda quando o material permitir.
- Landing sem bloquear LCP com canvas. Fonte com `swap`. Imagens, se existirem, em tamanho certo.
- Meta de TTI da aula continua < 3 s (seção 16). Motion não justifica bundle enorme: importar animações só nas rotas que usam.

---

## 16. Requisitos não-funcionais

| Tema | Meta MVP |
|---|---|
| Performance da app | TTI da aula < 3 s em banda razoável |
| Lab boot | ambiente pronto em < 45 s no caso feliz |
| Disponibilidade | best-effort no começo (projeto de estudo) |
| Segurança da plataforma | OWASP ASVS nível 1 como checklist interno |
| Privacidade | só dados necessários; e-mail para conta; labs sem PII real |
| LGPD | base legal no termo; exclusão de conta apaga progresso e para labs |
| Observabilidade | log de auth, de orquestração e de erros; sem logar senha/token |
| Custo | 1 lab por aluno limita explosão de containers |

---

## 17. Conteúdo de mídia (YouTube)

- Cada vídeo tem: `youtubeId`, título, duração ≤ 5:00, autor, por que foi escolhido, transcrição ou resumo oficial em pt-BR.
- Lista branca: só IDs cadastrados. Aluno não cola URL livre.
- Se o vídeo for removido: a unidade continua válida pelo texto + resumo.
- Critério editorial: explica conceito ou defesa; recusar “tutorial para hackear o site X”.

---

## 18. Stack sugerida (não é dogma)

Escolha pensada para um time júnior web:

| Camada | Sugestão | Motivo |
|---|---|---|
| Front + API | Next.js (App Router) + TypeScript | um repo, auth e UI no mesmo lugar |
| UI | Tailwind CSS + tokens próprios + Motion | visual denso e animado, sem kit genérico |
| Auth | Auth.js (NextAuth) + Google provider | OAuth sem reinventar |
| DB | PostgreSQL + Prisma ou Drizzle | progresso relacional claro |
| Conteúdo | MDX no repositório | review em PR |
| Labs | Docker + worker Node/Go simples | isolamento |
| Testes app | Playwright (smoke) + Vitest | |
| Testes de lab | suite no próprio image + HTTP checker | |
| Host | VPS única no começo; labs na mesma máquina com cota | barato para o grupo |

O repositório não seguiu a tabela inteira. Hoje está assim:

| Camada | No código |
|---|---|
| Front + API | Next.js 16 (App Router), React 19, TypeScript 5 |
| UI | Tailwind CSS 4 e `motion` na landing |
| Auth | Cookie httpOnly assinado no próprio código, bcrypt na senha, Google OAuth opcional. Não é Auth.js |
| DB | Postgres 16 via `pg`. Sem Prisma e sem Drizzle. O schema nasce na primeira requisição |
| Conteúdo | TypeScript em `src/content`. MDX ainda não |
| Labs | Docker quando existe; senão um processo Node em `127.0.0.1` |
| Testes | O CI roda lint, tipos, Vitest (`npm test`), build e smoke E2E (`npm run test:e2e`, job `e2e` com Postgres) |
| Host | Cada dev sobe com `npm run dev`. Não há servidor compartilhado |

Alternativa mais leve se o orquestrador atrasar o MVP: **labs locais via Docker Compose** que o aluno sobe na máquina, e a plataforma só marca “concluí” com um token de checker. Isso reduz risco e custo, com pior UX. A Fase 2 já sobe o lab na máquina de quem roda o app.

---

## 19. Métricas de sucesso

### Aprendizado

- % de alunos que passam do quiz 1 e chegam no lab L4.
- % que concluem L5 depois de entrar em L4 (é *o* número da tese pedagógica).
- Tentativas médias até o checker de defesa ficar verde.
- NPS interno do grupo após a trilha piloto.

### Produto

- Tempo até o primeiro quiz completo (ativação).
- Labs órfãos destruídos pelo TTL (saúde do orquestrador).
- Taxa de abandono na unidade 0 (se alta, o texto ético está ruim ou assustador demais — ajustar tom, não remover o gate).

Vanity metrics (page views, XP total) não guiam prioridade.

---

## 20. Requisitos legais e de comunicação

Textos obrigatórios na landing, no cadastro e no rodapé:

- uso exclusivo educacional em laboratórios próprios;
- é proibido usar o conteúdo contra sistemas sem autorização explícita e por escrito;
- a plataforma não fornece suporte a atividade ilegal;
- violação pode resultar em banimento da conta.

Unidade 0 cobre, em linguagem de júnior:

- diferença entre lab autorizado e sistema de terceiros;
- “eu posso testar o sistema da empresa?” → só com programa / autorização;
- responsabilidade profissional (código de ética do time).

---

## 21. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Aluno usa a técnica fora do lab | alto (legal + ético) | gate ético, copy defensivo, labs sem playbook portátil, sem ranking de “hacks” |
| Lab escapa para o host / internet | alto | isolamento, egress deny, sem socket, TTL |
| Orquestrador come o tempo do MVP | médio | fallback “lab local + checker” |
| Conteúdo vira tutorial ofensivo demais | alto | review de PR com checklist: tem defesa? tem alvo isolado? evita payload-receita? |
| OAuth / sessão da própria plataforma frágil | irônico e grave | a plataforma aplica as defesas que ensina |
| YouTube some ou é barulhento | baixo | texto é a fonte da verdade |
| Time júnior superestima escopo | alto | 1 trilha, 1 lab, auth simples |

Checklist de review de conteúdo (todo PR de aula):

- [ ] Explica a invariante quebrada
- [ ] Não ensina a atacar alvo real
- [ ] Tem analogia + visão do dev
- [ ] Quiz não cobra payload de memória
- [ ] Lab tem checker automático
- [ ] Defesa tem mão na massa
- [ ] Selo depende da defesa

---

## 22. Fases de entrega

Andamento em 2026-10-07. O que está marcado já roda no app.

### Fase 0 — Fundação (1–2 semanas)

- [x] App Next.js, TypeScript, Tailwind, Motion e ESLint.
- [x] Tokens visuais e landing com a trilha animada (Ética → SQL Injection → Defesa → Selo).
- [x] Telas de criar conta e entrar.
- [x] Auth com e-mail, senha (bcrypt) e sessão httpOnly. Google implementado, depende de credencial no ambiente.
- [x] Unidade 0, Regras do jogo: texto, duas questões, aceite e gate antes do início.
- [x] Começo do progresso: usuário, XP e a unidade `etica` em `progress`.
- [x] Player da trilha e quiz genérico: 70% para avançar, explicação em cada erro, XP uma vez, ordem travada.
- [x] Teoria de SQL Injection publicada: unidades 1–5, 7, 8 e 10. Os labs 6 e 9 e o selo entram na Fase 1.
- [x] CI básico. Em todo pull request: `npm ci`, lint, `next typegen`, `tsc --noEmit` e `npm run build`. O ramo `main` exige pull request e esse check verde. Aprovação de outra pessoa ainda não é obrigatória.
- [ ] Verificação de e-mail (sem SMTP ainda).
- [x] Postgres no lugar do SQLite local. Sobe com `docker compose up -d`. `npm run db:import` copia o arquivo antigo uma vez, se o Postgres ainda estiver vazio.
- [ ] Arquivos MDX. O conteúdo desta leva está em `src/content`, versionado no Git, no formato que o player já lê.

### Fase 1 — Trilha SQLi sem orquestrador elástico

- [x] Unidades 1–5, 7, 8 e 10 publicadas no player.
- [x] Lab ofensivo: sintoma no app fictício e a linha que quebrou a fronteira. Sem receita de ataque.
- [x] Lab defensivo: o aluno separa o valor da instrução e os testes do app corrigido ficam verdes. O código enviado não é executado no servidor.
- [x] Selo de SQL Injection, só com o lab defensivo e o checkpoint.

### Fase 2 — Lab remoto de verdade

- [x] Orquestrador: um ambiente por aluno, 75 minutos, container sem privilégio e sem saída para a internet. Se o Docker não subir, o mesmo app roda preso em 127.0.0.1.
- [x] Painel “Ambiente ativo · encerrar” em todas as telas logadas.
- [x] Checker HTTP contra a Pizzaria do Lab: login da Alice, senha errada recusada, listagem sem o pedido do Bruno.
- [x] Sair da conta encerra o ambiente.

### Fase 3 — Segunda trilha: sessão

- [x] Motor reusado: a mesma ética, o mesmo quiz a 70% e o mesmo selo, agora com a trilha em `/trilha/sessao`.
- [x] Unidades: chave temporária, marcas do cookie, sintomas, lab de flags e checkpoint. O selo `selo-sessao` só sai com o lab e o checkpoint.
- [x] Início lista as duas trilhas. Com um selo a conta fica Pleno defensivo; com os dois, Especialista. A trilha de SQL, quando o selo já existe, aponta para a de sessão.

### Fase 4 — Squad, mentor e streak

- [x] Sequência de dias: a primeira unidade concluída no dia conta. O dia é o de São Paulo. Se o dia anterior ficou vazio, a sequência na tela volta a zero.
- [x] Time em `/squad`: quem abre vira mentor e recebe um código. Todo o time vê nota, tentativas, ranking de cada trilha e ranking geral.
- [x] A nota é a média das unidades já pontuadas. A ordem segue essa média. No empate, menos tentativas fica na frente. Quem abre o time é quem pode encerrá-lo.

### O que falta

Quem chega no repositório encontra instalação, variáveis e o fluxo de pull request no `README.md`.

#### Já no ar (2026-10-07)

- [x] Next na Vercel, plano free, ligado ao `main`. Merge publica sozinho.
- [x] Postgres no Supabase. Em produção, `DATABASE_URL` usa a URI do **Session pooler** (porta `5432`, host `pooler.supabase.com`, usuário `postgres.[ref]`). A conexão **Direct** (`db.[ref].supabase.co`) não funciona na Vercel. O placeholder `[YOUR-PASSWORD]` da URI deve virar a senha pura, sem colchetes.
- [x] `AUTH_SECRET` e Google OAuth em produção. URI autorizado: `https://estudos-hacker.vercel.app/api/auth/google/callback`.
- [x] CI no GitHub. Pull request obrigatório no `main`. Jobs `check` (lint, tipos, Vitest, build) e `e2e` (Playwright + Postgres).
- [x] README com stack, instalação do zero, variáveis, contribuição e leitura de logs do CI.

#### Operacional (time)

- [ ] Convidar colaboradores no GitHub (**Settings → Collaborators**) para enviar código sem fork.
- [ ] Comunicar ao time: trilha e lab ofensivo funcionam em https://estudos-hacker.vercel.app; Docker só se alguém ligar `LAB_RUNTIME=local` (ver 12.3).
#### Produto e código

- [x] Laboratório da pizzaria embutido em `/lab/pizzaria` (Vercel e local). Modo Docker legado com `LAB_RUNTIME=local` (ver 12.3).
- [ ] Recuperação de senha por e-mail.
- [ ] Verificação de e-mail no cadastro. Não há SMTP.
- [ ] Conteúdo em MDX. O player lê `src/content`.
- [x] Vitest na lógica pura (`lab-check`, nota do quiz, streak, desbloqueio de unidade). Comando: `npm test`.
- [x] Playwright de smoke no app (landing, cadastro, regras, trilha SQL). Comando: `npm run test:e2e` (Postgres + build).
- [ ] Cenas da seção 15.4 que ainda não estão na tela: traço de luz entre os nós, shake do quiz errado e as três etapas nomeadas no boot do lab.
- [x] Trilha **Autenticação quebrada e senhas** (`/trilha/autenticacao`): teoria, quiz, lab de endurecimento de login e selo `selo-autenticacao`.
- [ ] Próximas trilhas, nesta ordem: XSS, CSRF, phishing interno, controle de acesso, headers. SSRF e upload ficam para depois.
- [ ] Aprovação obrigatória de outra pessoa no pull request (opcional; hoje só o check verde é exigido).

#### Decisões em aberto

- [ ] Nome final do produto.
- [ ] YouTube opcional nas unidades (texto já cobre tudo).

---

## 23. Critérios de pronto do MVP

O MVP está pronto quando um colega que **não escreveu o conteúdo** consegue, sem ajuda fora da UI:

1. criar conta com Google;
2. passar pela ética;
3. concluir SQL Injection até o selo;
4. no lab defensivo, fazer os testes passarem;
5. ver o badge na home;
6. não encontrar na UI nenhum incentivo a testar site de terceiros.

**Andamento (2026-10-07):** itens 1–3, 4–6 funcionam na Vercel com o lab embutido (seção 12.3). A trilha de sessão inteira também funciona na Vercel.

---

## 24. Fora de escopo (explícito)

- Ensinar ou automatizar invasão de sistemas reais.
- Ferramentas de phishing real, keylogger, malware, ransomware.
- Exploração de infra de terceiros, Wi-Fi alheio, redes corporativas sem autorização.
- Geração de exploits por IA dentro do produto.
- Certificação oficial de mercado (CISSP, eJPT, etc.). Selos são internos e pedagógicos.
- Rede social completa.

---

## 25. Decisões em aberto (para o time votar)

Ainda em aberto:

1. **Nome final** do produto.
2. **YouTube** (recomendação já seguida no código: texto obrigatório, vídeo ainda não entrou).

Já decidido e no código:

- Lab na máquina de quem roda o app, com Docker e reserva em processo Node. Não há orquestrador elástico.
- Editor de defesa no browser. O servidor não executa o código enviado.
- Trilhas no ar: SQL Injection, Sessão, Autenticação quebrada e senhas.
- Ranking só dentro do time, com nome, nota e tentativas.

---

## 26. Histórias de usuário (backlog inicial)

### Conta

- Como visitante, quero criar conta com e-mail para guardar meu progresso.
- Como visitante, quero entrar com Google para não criar senha nova.
- Como aluno, preciso aceitar as regras éticas antes de ver laboratórios.

### Trilha

- Como aluno, quero ver um mapa da trilha para saber onde estou.
- Como aluno, quero ler a teoria em blocos curtos e só então fazer o quiz.
- Como aluno, se eu errar o quiz, quero entender o motivo e tentar de novo.
- Como aluno, quero um laboratório isolado para reproduzir o problema com dados fictícios.
- Como aluno, quero corrigir o código e ver testes confirmando que o vetor fechou.
- Como aluno, quero um selo ao terminar teoria + defesa.

### Plataforma

- Como admin, quero publicar unidades via Git sem CMS.
- Como sistema, preciso destruir labs expirados para não vazar recurso.
- Como sistema, não posso deixar o lab falar com a internet.

---

## 27. Resumo executivo

ShieldPath é uma plataforma de estudo para devs júnior: autenticação simples, trilhas sequenciais, teoria curta, quiz, prática em laboratório isolado e, obrigatoriamente, defesa no código. A interface é escura, em Tailwind, e prende em três cenas — a trilha se desenhando na entrada, o nó acendendo no progresso e o selo montando no fim. A primeira especialidade é SQL Injection. O sucesso não é o aluno “virar hacker”; é ele conseguir **explicar o buraco e fechá-lo**. Tudo que incentiva uso contra sistemas reais está fora da spec de propósito.
