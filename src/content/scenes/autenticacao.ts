import type { SceneCatalog } from "./types";

export const authenticationScenes = {
  "autenticacao:auth-proposito": {
    id: "auth-proposito-fluxo",
    type: "flow",
    eyebrow: "Papéis do login",
    title: "Provar identidade abre todas as portas?",
    accessibleSummary:
      "A autenticação verifica uma prova de identidade; depois, uma sessão mantém essa identidade entre pedidos; por fim, a autorização decide quais recursos ela pode acessar.",
    caption: "Login prova quem é a pessoa, mas continuidade e permissão são decisões separadas.",
    tone: "neutral",
    steps: [
      { id: "autenticar", label: "Autenticação", detail: "Verifica a prova de identidade sem revelar contas pela resposta." },
      { id: "continuar", label: "Sessão", detail: "Mantém a identidade sem reenviar a senha." },
      { id: "permitir", label: "Autorização", detail: "Decide o acesso a cada recurso." },
    ],
  },
  "autenticacao:auth-senha": {
    id: "auth-senha-fronteira",
    type: "boundary",
    eyebrow: "Dentro do servidor",
    title: "O que pode sobreviver a um vazamento?",
    accessibleSummary:
      "O servidor não deve guardar senha legível: ele armazena um hash não reversível produzido com salt único, algoritmo próprio para senhas e custo adequado; antes disso, a política de cadastro recusa senhas fracas ou comuns.",
    caption: "Política reduz escolhas previsíveis; hash com salt e custo torna tentativas após vazamento mais difíceis.",
    tone: "defense",
    zones: [
      {
        id: "cadastro",
        label: "Antes de armazenar",
        description: "A entrada precisa atender à regra de cadastro.",
        items: ["Recusar senhas muito curtas", "Recusar senhas óbvias ou conhecidas"],
      },
      {
        id: "armazenamento",
        label: "No armazenamento",
        description: "Guardar apenas a prova não reversível.",
        items: ["Salt único", "bcrypt, scrypt ou Argon2", "Custo adequado"],
      },
    ],
  },
  "autenticacao:auth-sintomas": {
    id: "auth-sintomas-sequencia",
    type: "sequence",
    eyebrow: "Pistas do fluxo",
    title: "Que detalhe ajuda a adivinhar uma conta?",
    accessibleSummary:
      "Uma credencial padrão permite acesso previsível; respostas diferentes confirmam se uma conta existe; tentativas repetidas sem limite facilitam automação. Remoção da credencial, resposta coerente e rate limiting tratam caminhos distintos.",
    caption: "Diagnosticar o fluxo inteiro evita trocar uma resposta reveladora por outro sinal equivalente.",
    tone: "danger",
    events: [
      { id: "padrao", marker: "1", label: "Credencial padrão", detail: "Remover combinações públicas ou previsíveis até em staging." },
      { id: "resposta", marker: "2", label: "Resposta reveladora", detail: "Usar texto e estado coerentes para toda falha de credencial." },
      { id: "repeticao", marker: "3", label: "Tentativas repetidas", detail: "Aplicar rate limiting; CAPTCHA pode ser uma camada adicional." },
    ],
  },
  "autenticacao:auth-lab": {
    id: "auth-lab-checklist",
    type: "decision",
    eyebrow: "Checklist simulado",
    title: "Qual pacote protege o fluxo inteiro?",
    accessibleSummary:
      "A cena representa uma decisão de checklist, não a execução de hash nem de um endpoint: escolher algoritmo próprio para senhas, resposta de falha coerente, política mínima de cadastro e rate limiting.",
    caption: "O checker confirma opções marcadas na simulação; não mede tentativas nem certifica um login real.",
    tone: "defense",
    prompt: "Qual conjunto deve ser submetido à inspeção simulada?",
    options: [
      {
        id: "base64",
        label: "Base64 e mensagens detalhadas",
        outcome: "A senha continua recuperável e a resposta revela quais contas existem.",
      },
      {
        id: "captcha",
        label: "Apenas CAPTCHA",
        outcome: "Pode dificultar automação, mas não protege armazenamento, cadastro ou resposta.",
      },
      {
        id: "conjunto",
        label: "Armazenamento, resposta, política e limite",
        outcome: "Combina hash próprio para senha, resposta coerente, política mínima e rate limiting.",
        recommended: true,
      },
    ],
  },
  "autenticacao:auth-checkpoint": {
    id: "auth-checkpoint-comparacao",
    type: "compare",
    eyebrow: "Alcance da evidência",
    title: "O selo comprova uma aplicação segura?",
    accessibleSummary:
      "O checkpoint distingue o que o laboratório demonstra — escolhas corretas em um checklist simulado — do que uma aplicação real ainda exige: implementação, revisão, testes e observação do comportamento.",
    caption: "O selo confirma aprendizagem das decisões; segurança real depende de aplicar e verificar cada uma delas.",
    tone: "accent",
    sides: [
      {
        id: "demonstra",
        label: "O checklist demonstra",
        description: "Evidência produzida dentro da trilha.",
        items: ["Decisões esperadas foram selecionadas", "Riscos foram ligados a controles coerentes"],
      },
      {
        id: "nao-demonstra",
        label: "O checklist não demonstra",
        description: "Evidência necessária em uma aplicação real.",
        items: ["Hash ou endpoint realmente executado", "Limites medidos e implementação revisada"],
      },
    ],
  },
} satisfies SceneCatalog;
