import type { Unit } from "@/content/sql-injection";

// Texto de cada unidade: src/content/upload/<id>.mdx
export const TRAIL = {
  slug: "upload",
  title: "Upload inseguro",
  summary:
    "Acompanhe o arquivo da entrada à entrega: limite bytes, valide e reprocesse o conteúdo, gere o nome e isole a origem.",
};

export const UNITS: Unit[] = [
  {
    id: "upload-proposito",
    order: 1,
    title: "Arquivo não é só arquivo",
    summary: "O risco não é o upload em si, é o que o servidor faz com ele depois.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "order",
        id: "caminho-seguro",
        prompt: "Missão: coloque o caminho de um upload seguro na ordem",
        items: [
          { id: "entregar", label: "Entregar por uma origem isolada" },
          { id: "receber", label: "Receber o arquivo em uma área temporária" },
          { id: "salvar", label: "Salvar com um nome criado pelo servidor" },
          { id: "validar", label: "Validar tamanho, tipo e conteúdo" },
        ],
        correctOrder: ["receber", "validar", "salvar", "entregar"],
        explain: "Primeiro isole o recebimento, depois valide o conteúdo. Só então salve com um nome seguro e entregue por uma origem separada.",
      },
      {
        kind: "choice",
        id: "contenttype",
        prompt: "O formulário declara `Content-Type: image/png`, um rótulo de formato. Isso prova que o conteúdo é uma imagem?",
        choices: [
          {
            id: "nao",
            label: "Não. Esse valor é escrito pelo cliente e pode ser qualquer coisa",
            correct: true,
            explain: "O servidor confere o conteúdo (assinatura do arquivo) e, para imagem, reprocessa.",
          },
          {
            id: "sim",
            label: "Sim, o navegador sempre informa certo",
            explain: "Quem manda o pedido escolhe o header. Não precisa ser um navegador.",
          },
        ],
      },
      {
        kind: "choice",
        id: "html",
        prompt: "Por que um `.html` ou `.svg` enviado e servido no mesmo domínio é perigoso?",
        choices: [
          {
            id: "xss",
            label: "Ao abrir o link, o script dentro dele roda com a origem do seu site",
            correct: true,
            explain:
              "Se o arquivo for servido na origem do site, vira Cross-Site Scripting (XSS) armazenado. HttpOnly impede o script de ler o cookie, mas o navegador ainda pode enviá-lo em ações autenticadas.",
          },
          {
            id: "lento",
            label: "Porque SVG é pesado",
            explain: "O peso não é o problema. SVG aceita script, e no seu domínio ele roda como se fosse seu.",
          },
        ],
      },
    ],
  },
  {
    id: "upload-defesas",
    order: 2,
    title: "Nome, conteúdo e entrega",
    summary: "Três decisões do servidor fecham quase tudo.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "nome",
        prompt: "Por que o nome do arquivo salvo deve ser gerado pelo servidor?",
        choices: [
          {
            id: "path",
            label: "Nome do usuário pode trazer `../` e gravar fora da pasta, ou sobrescrever outro arquivo",
            correct: true,
            explain: "Path traversal. Com nome aleatório do servidor, o usuário não escolhe onde o arquivo cai.",
          },
          {
            id: "bonito",
            label: "Para o nome ficar mais bonito na URL",
            explain: "Estética não é o motivo. O nome do cliente é entrada não confiável.",
          },
        ],
      },
      {
        kind: "choice",
        id: "extensao",
        prompt: "Checar só a extensão `.png` no nome basta?",
        choices: [
          {
            id: "nao",
            label: "Não. Extensão é texto do cliente; o conteúdo precisa bater com o tipo esperado",
            correct: true,
            explain: "`foto.png.php` ou um HTML renomeado passam na extensão. A assinatura dos primeiros bytes não mente tão fácil, e reprocessar a imagem limpa o resto.",
          },
          {
            id: "sim",
            label: "Sim, a extensão define o tipo",
            explain: "Quem define o tipo é o conteúdo. A extensão é só um rótulo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "entrega",
        prompt: "Como servir os arquivos enviados com menos risco?",
        choices: [
          {
            id: "isolado",
            label: "De uma origem separada, sem cookies da aplicação e com `X-Content-Type-Options: nosniff`",
            correct: true,
            explain:
              "Uma origem realmente separada não recebe a sessão do app. Para arquivos destinados a download, `Content-Disposition: attachment` pode acrescentar outra barreira; um avatar exibido na página não usa esse mesmo contrato.",
          },
          {
            id: "public",
            label: "Na pasta `public/` do app, para o link ser simples",
            explain: "Na pasta pública do mesmo domínio, um HTML enviado vira página do seu site.",
          },
        ],
      },
    ],
  },
  {
    id: "upload-sintomas",
    order: 3,
    title: "Sintomas no código",
    summary: "Ler a rota de upload e achar o que o servidor confiou no cliente.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "linha",
        prompt: "Na versão vulnerável, qual linha é a mais perigosa?",
        choices: [
          {
            id: "path",
            label: "`path.join(\"public/uploads\", file.name)` com o nome que veio do cliente",
            correct: true,
            explain: "O cliente escolhe o caminho e a pasta é servida pelo próprio site.",
          },
          {
            id: "await",
            label: "O `await` da gravação",
            explain: "Assíncrono ou não, o arquivo cai onde o cliente mandou.",
          },
        ],
      },
      {
        kind: "choice",
        id: "tamanho",
        prompt: "Por que limitar o tamanho no servidor?",
        choices: [
          {
            id: "dos",
            label: "Sem limite, um arquivo gigante enche disco ou memória e derruba o serviço",
            correct: true,
            explain: "Limite no servidor, antes de ler o arquivo inteiro. O `accept` do input é só dica para o navegador.",
          },
          {
            id: "bonito",
            label: "Para a foto não ficar grande na tela",
            explain: "Exibir menor é CSS. O limite é proteção do servidor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "svg",
        prompt: "O produto quer aceitar avatar em Scalable Vector Graphics (SVG), formato vetorial baseado em Extensible Markup Language (XML). Qual é a decisão mais segura?",
        choices: [
          {
            id: "recusar",
            label: "Recusar SVG ou convertê-lo para PNG no servidor",
            correct: true,
            explain:
              "SVG é baseado em XML e pode conter script ou outros recursos ativos. Recusar ou converter para PNG evita servir esse conteúdo ativo como avatar.",
          },
          {
            id: "aceitar",
            label: "Aceitar e servir como `image/svg+xml` no mesmo domínio",
            explain: "Aberto direto, o SVG roda o script dele com a origem do seu site.",
          },
        ],
      },
      {
        kind: "text",
        id: "frase",
        prompt: "Em uma frase: por que nome, tipo e tamanho são decididos pelo servidor?",
        min: 18,
        stems: ["cliente", "servidor", "confi", "controla", "usuário", "usuario"],
        explain: "Tudo o que vem no pedido é escolhido pelo cliente. Só o servidor decide o que aceita e onde guarda.",
      },
    ],
  },
  {
    id: "upload-lab",
    order: 4,
    title: "Fechar o upload de avatar",
    summary: "Configure a rota fictícia de avatar. O checker confere a regra, não recebe arquivo nenhum.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "upload-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de upload espera o lab verde e este checkpoint.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto fecha o upload de avatar?",
        choices: [
          {
            id: "camadas",
            label: "Conteúdo conferido e reprocessado, nome gerado, limite de tamanho e entrega isolada",
            correct: true,
            explain: "Cada decisão do servidor fecha um caminho: executar, sobrescrever, derrubar ou virar página.",
          },
          {
            id: "accept",
            label: "`accept=\"image/*\"` no input e checar a extensão",
            explain: "Os dois são do cliente ou do nome. Nenhum olha o conteúdo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "contenttype",
        prompt: "O `Content-Type` do pedido deve decidir se o arquivo é aceito?",
        choices: [
          {
            id: "nao",
            label: "Não. Ele pode ajudar a recusar cedo, mas quem decide é o conteúdo",
            correct: true,
            explain: "Header do cliente é dica, não prova.",
          },
          { id: "sim", label: "Sim, é a fonte mais confiável", explain: "Quem escreve o header é quem envia o arquivo." },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de upload pode sair?",
        choices: [
          { id: "lab", label: "Depois do lab e deste checkpoint", correct: true, explain: "Teoria mais defesa conferida." },
          { id: "ler", label: "Depois de ler sobre path traversal", explain: "Leitura não fecha a rota." },
        ],
      },
    ],
  },
];
