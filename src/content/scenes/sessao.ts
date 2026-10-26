import type { SceneCatalog } from "./types";

export const sessionScenes = {
  "sessao:sessao-chave": {
    id: "sessao-chave-ciclo",
    type: "lifecycle",
    eyebrow: "Vida da chave",
    title: "Como o site lembra sem guardar a senha?",
    accessibleSummary:
      "Após o login, o servidor cria uma sessão e entrega uma chave temporária ao navegador; nos pedidos seguintes, o navegador reapresenta a chave e o servidor a valida até sua expiração ou revogação.",
    caption: "A chave liga pedidos à sessão por tempo limitado; ela não é a senha nem concede toda permissão.",
    tone: "neutral",
    stages: [
      { id: "login", label: "Login", detail: "A identidade é verificada uma vez." },
      { id: "criacao", label: "Criação", detail: "O servidor cria a sessão e uma chave temporária." },
      { id: "uso", label: "Pedidos seguintes", detail: "O navegador reapresenta a chave; o servidor a valida." },
      { id: "fim", label: "Fim", detail: "Expiração ou revogação encerra a validade." },
    ],
  },
  "sessao:sessao-flags": {
    id: "sessao-flags-fronteiras",
    type: "boundary",
    eyebrow: "Limites da chave",
    title: "Qual porta cada proteção fecha?",
    accessibleSummary:
      "No navegador, HttpOnly limita a leitura por JavaScript, Secure limita o envio a HTTPS e SameSite limita contextos entre sites; no servidor, rotação, invalidação e expiração controlam a vida da chave.",
    caption: "Cada controle cobre um caminho diferente; juntos, eles reduzem leitura, transporte indevido, envio entre sites e reutilização.",
    tone: "defense",
    zones: [
      {
        id: "navegador",
        label: "Limites no navegador",
        description: "Instruções associadas ao cookie.",
        items: ["HttpOnly: sem leitura por JavaScript", "Secure: somente por HTTPS", "SameSite: contexto entre sites"],
      },
      {
        id: "servidor",
        label: "Decisões no servidor",
        description: "Controle da validade da sessão.",
        items: ["Nova chave no login", "Invalidação no logout", "Expiração definida"],
      },
    ],
  },
  "sessao:sessao-sintomas": {
    id: "sessao-sintomas-comparacao",
    type: "compare",
    eyebrow: "Sintoma e controle",
    title: "Cada pista aponta para qual limite?",
    accessibleSummary:
      "Se JavaScript lê o cookie, falta HttpOnly; se a chave viaja sem HTTPS, falta Secure; se a mesma chave permanece após o login, falta rotação. Cada sintoma exige o controle correspondente.",
    caption: "Os controles não são intercambiáveis: leitura, transporte e ciclo de vida têm responsáveis distintos.",
    tone: "danger",
    sides: [
      {
        id: "observado",
        label: "Sintoma observado",
        description: "O que a inspeção permite ver.",
        items: ["Script lê a chave", "Chave segue por HTTP", "Chave não muda no login"],
      },
      {
        id: "decisao",
        label: "Decisão correspondente",
        description: "O limite relacionado a cada pista.",
        items: ["Adicionar HttpOnly", "Exigir Secure e oferecer HTTPS", "Rotacionar a chave"],
      },
    ],
  },
  "sessao:sessao-lab": {
    id: "sessao-lab-checklist",
    type: "decision",
    eyebrow: "Checklist simulado",
    title: "Qual configuração fecha os caminhos vistos?",
    accessibleSummary:
      "A cena representa uma decisão de checklist, não a configuração de um servidor real: selecionar HttpOnly, Secure, SameSite Lax ou Strict, rotação no login e invalidação no logout.",
    caption: "O lab registra escolhas simuladas; não cria sessão, não configura cookie e não inspeciona uma aplicação real.",
    tone: "defense",
    prompt: "Qual conjunto deve ser marcado no checklist do laboratório?",
    options: [
      {
        id: "somente-httponly",
        label: "Somente HttpOnly",
        outcome: "Limita a leitura por script, mas deixa sem resposta os demais caminhos estudados.",
      },
      {
        id: "none-sem-ciclo",
        label: "SameSite=None sem rotação",
        outcome: "Amplia o envio entre sites e mantém uma chave antiga reutilizável.",
      },
      {
        id: "conjunto",
        label: "Limites do cookie e ciclo completo",
        outcome: "Marca HttpOnly, Secure, SameSite Lax ou Strict, rotação no login e invalidação no logout.",
        recommended: true,
      },
    ],
  },
  "sessao:sessao-checkpoint": {
    id: "sessao-checkpoint-ciclo",
    type: "lifecycle",
    eyebrow: "Síntese da sessão",
    title: "A proteção termina no cookie?",
    accessibleSummary:
      "Uma sessão protegida nasce com chave nova após o login, circula apenas nos contextos permitidos, é validada pelo servidor e termina por logout, revogação ou expiração; atributos do cookie não substituem esse ciclo.",
    caption: "Proteger a chave exige combinar limites de uso no navegador com início e fim controlados no servidor.",
    tone: "accent",
    stages: [
      { id: "nascer", label: "Nascer", detail: "Gerar uma chave nova depois do login." },
      { id: "circular", label: "Circular", detail: "Aplicar HttpOnly, Secure e SameSite adequado." },
      { id: "validar", label: "Validar", detail: "O servidor reconhece somente uma sessão ainda válida." },
      { id: "encerrar", label: "Encerrar", detail: "Invalidar no logout ou ao revogar e respeitar a expiração." },
    ],
  },
} satisfies SceneCatalog;
