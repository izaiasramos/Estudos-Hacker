import type { Unit } from "@/content/sql-injection";

// Texto de cada unidade: src/content/ssrf/<id>.mdx
export const TRAIL = {
  slug: "ssrf",
  title: "SSRF",
  summary:
    "Quando o servidor busca uma URL que o usuário escolheu e acaba batendo na rede interna — e como lista permitida, checagem do IP resolvido e redirect sob controle fecham o buraco.",
};

export const UNITS: Unit[] = [
  {
    id: "ssrf-proposito",
    order: 1,
    title: "O servidor busca por você",
    summary: "SSRF transforma o servidor num navegador que o usuário dirige.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "definicao",
        prompt: "O que caracteriza SSRF (Server-Side Request Forgery)?",
        choices: [
          {
            id: "servidor",
            label: "O servidor faz um pedido HTTP para um endereço que o usuário controla",
            correct: true,
            explain: "Quem faz o pedido é o servidor, de dentro da rede dele. Por isso ele alcança o que o usuário não alcança.",
          },
          {
            id: "navegador",
            label: "O navegador da vítima envia um pedido forjado",
            explain: "Isso é CSRF. No SSRF quem busca é o servidor.",
          },
          {
            id: "sql",
            label: "A URL entra concatenada numa consulta SQL",
            explain: "Isso é SQL Injection. SSRF é sobre para onde o servidor faz o pedido.",
          },
        ],
      },
      {
        kind: "choice",
        id: "perigo",
        prompt: "Por que um pedido feito pelo servidor é mais perigoso que um feito pelo usuário?",
        choices: [
          {
            id: "rede",
            label: "O servidor está dentro da rede: alcança banco, painéis internos e serviços da nuvem",
            correct: true,
            explain: "O firewall barra o usuário de fora, mas confia no servidor de dentro.",
          },
          {
            id: "rapido",
            label: "Porque o servidor tem internet mais rápida",
            explain: "Velocidade não é o problema. O problema é o lugar de onde o pedido sai.",
          },
        ],
      },
      {
        kind: "choice",
        id: "onde",
        prompt: "Qual funcionalidade é candidata clássica a SSRF?",
        choices: [
          {
            id: "preview",
            label: "Prévia de link, importar imagem por URL ou webhook configurável",
            correct: true,
            explain: "Em todas, o usuário entrega uma URL e o servidor vai buscá-la.",
          },
          {
            id: "css",
            label: "Trocar o tema da página para escuro",
            explain: "Tema roda no navegador e não faz o servidor buscar nada.",
          },
        ],
      },
    ],
  },
  {
    id: "ssrf-defesas",
    order: 2,
    title: "Onde a checagem falha",
    summary: "Conferir o texto da URL não basta: o que conta é o IP de verdade.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "texto",
        prompt: "O time bloqueia URLs que contêm a palavra `localhost`. Fechou?",
        choices: [
          {
            id: "nao",
            label: "Não. Outro nome ou outra forma de escrever o IP chegam ao mesmo lugar",
            correct: true,
            explain: "Lista de bloqueio por texto sempre esquece uma forma. A checagem tem de ser no IP resolvido.",
          },
          {
            id: "sim",
            label: "Sim, localhost é o único endereço interno",
            explain: "Há faixas privadas inteiras (10.x, 192.168.x, 172.16–31.x) e o endereço de metadados da nuvem.",
          },
        ],
      },
      {
        kind: "choice",
        id: "redirect",
        prompt: "A URL aprovada responde com um redirect para um IP interno. O que deveria acontecer?",
        choices: [
          {
            id: "rechecar",
            label: "Não seguir o redirect, ou checar de novo o destino antes de seguir",
            correct: true,
            explain: "Cada salto é uma URL nova. Seguir sem checar desfaz a validação da primeira.",
          },
          {
            id: "seguir",
            label: "Seguir, já que a primeira URL passou na checagem",
            explain: "É exatamente o atalho que transforma uma URL inocente em pedido interno.",
          },
        ],
      },
      {
        kind: "choice",
        id: "metadados",
        prompt: "Por que o endereço `169.254.169.254` aparece em todo guia de SSRF?",
        choices: [
          {
            id: "nuvem",
            label: "Em nuvens como AWS, ele serve dados da máquina, às vezes credenciais temporárias",
            correct: true,
            explain: "Por isso a defesa bloqueia link-local e, na AWS, exige IMDSv2 com token.",
          },
          {
            id: "dns",
            label: "É o DNS público do Google",
            explain: "O DNS do Google é 8.8.8.8. 169.254.x.x é link-local, só existe dentro da máquina ou da rede.",
          },
        ],
      },
    ],
  },
  {
    id: "ssrf-sintomas",
    order: 3,
    title: "Sintomas no código",
    summary: "Achar o `fetch` que recebe a URL do usuário sem freio.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "linha",
        prompt: "Na versão vulnerável, qual é o problema central?",
        choices: [
          {
            id: "fetch",
            label: "`fetch(req.body.url)` sem checar esquema, host nem IP resolvido",
            correct: true,
            explain: "A URL do usuário vira o destino do servidor sem nenhuma regra no meio.",
          },
          {
            id: "json",
            label: "Responder em JSON",
            explain: "O formato da resposta não muda para onde o pedido foi.",
          },
        ],
      },
      {
        kind: "choice",
        id: "esquema",
        prompt: "Por que aceitar só `https:` (e talvez `http:`) no esquema?",
        choices: [
          {
            id: "outros",
            label: "Outros esquemas, como `file:` ou `gopher:`, leem arquivo local ou falam com outros serviços",
            correct: true,
            explain: "Lista permitida de esquema corta uma classe inteira de abuso.",
          },
          {
            id: "seo",
            label: "Por causa de SEO",
            explain: "SEO não tem relação. É sobre o que o cliente HTTP do servidor consegue abrir.",
          },
        ],
      },
      {
        kind: "choice",
        id: "resposta",
        prompt: "O servidor devolve ao usuário o corpo inteiro do que buscou. Qual o risco extra?",
        choices: [
          {
            id: "vaza",
            label: "Se algo interno passar, o conteúdo dele volta direto para quem pediu",
            correct: true,
            explain: "Prévia de link precisa de título e imagem, não da página crua. Devolva só o necessário, com limite de tamanho e tempo.",
          },
          {
            id: "nenhum",
            label: "Nenhum, o problema é só o pedido",
            explain: "Devolver o corpo transforma um pedido cego em leitura do que estava lá dentro.",
          },
        ],
      },
      {
        kind: "text",
        id: "frase",
        prompt: "Em uma frase: por que a checagem tem de olhar o IP resolvido e não o texto da URL?",
        min: 18,
        stems: ["ip", "resolv", "dns", "nome", "endereço", "endereco", "interno"],
        explain: "Um nome inocente pode resolver para um IP interno. Só o IP final diz para onde o pedido vai.",
      },
    ],
  },
  {
    id: "ssrf-lab",
    order: 4,
    title: "Fechar a prévia de link",
    summary: "Configure a busca de prévia da Pizzaria do Lab. O checker confere a regra, não faz pedido nenhum.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "ssrf-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de SSRF espera o lab verde e este checkpoint.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto fecha SSRF numa prévia de link?",
        choices: [
          {
            id: "camadas",
            label: "Esquema permitido, IP resolvido fora de faixa interna, redirect checado e resposta resumida",
            correct: true,
            explain: "Cada camada fecha um caminho diferente até a rede interna.",
          },
          {
            id: "regex",
            label: "Uma regex que recusa `localhost` e `127.0.0.1`",
            explain: "Bloqueio por texto deixa passar outros nomes, faixas privadas e redirects.",
          },
        ],
      },
      {
        kind: "choice",
        id: "rede",
        prompt: "Além do código, o que a infraestrutura pode fazer?",
        choices: [
          {
            id: "egress",
            label: "Rodar quem busca URLs numa rede sem acesso ao interno e exigir token nos metadados da nuvem",
            correct: true,
            explain: "Se o código falhar, a rede ainda segura. É como o lab desta plataforma roda: rede sem saída.",
          },
          {
            id: "nada",
            label: "Nada, SSRF é só problema de código",
            explain: "Defesa em camada vale aqui também. A rede é a última linha.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de SSRF pode sair?",
        choices: [
          { id: "lab", label: "Depois do lab e deste checkpoint", correct: true, explain: "Teoria mais defesa conferida." },
          { id: "ler", label: "Depois de ler sobre metadados da nuvem", explain: "Leitura não fecha a busca." },
        ],
      },
    ],
  },
];
