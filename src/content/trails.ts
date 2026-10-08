import { TRAIL as authTrail, UNITS as authUnits } from "@/content/autenticacao";
import { TRAIL as accessTrail, UNITS as accessUnits } from "@/content/controle-acesso";
import { TRAIL as sqlTrail, UNITS as sqlUnits, type Unit } from "@/content/sql-injection";
import { TRAIL as sessionTrail, UNITS as sessionUnits } from "@/content/sessao";
import { TRAIL as csrfTrail, UNITS as csrfUnits } from "@/content/csrf";
import { TRAIL as phishingTrail, UNITS as phishingUnits } from "@/content/phishing";
import { TRAIL as xssTrail, UNITS as xssUnits } from "@/content/xss";

export type Trail = {
  slug: string;
  title: string;
  summary: string;
  sealId: string;
  units: Unit[];
  /** O selo só sai com estas duas unidades concluídas (seção 4.3 da spec: defesa é o destino). */
  labUnitId: string;
  checkpointId: string;
  /**
   * Publicação via Git (seção 7.1 e 11.3): trilha em rascunho só aparece para admin.
   * Sem o campo, a trilha está publicada.
   */
  status?: "rascunho";
  /** Texto da página da trilha quando todas as unidades abertas já foram, mas o selo ainda não saiu. */
  sealPending: string;
  /** Cena do selo em /trilha/[slug]/selo. */
  seal: {
    badge: string;
    name: string;
    text: string;
    tone: "accent" | "defense";
  };
};

export const TRAILS: Trail[] = [
  {
    ...sqlTrail,
    sealId: "selo",
    labUnitId: "lab-defensivo",
    checkpointId: "checkpoint",
    units: sqlUnits,
    sealPending: "O selo espera o laboratório em que a defesa passa nos testes.",
    seal: {
      badge: "SQL",
      name: "SQL Injection",
      text: "Você explicou a fronteira e fechou as duas consultas do lab. O login da Alice continua válido. O pedido do Bruno fica de fora.",
      tone: "accent",
    },
  },
  {
    ...sessionTrail,
    sealId: "selo-sessao",
    labUnitId: "sessao-lab",
    checkpointId: "sessao-checkpoint",
    units: sessionUnits,
    sealPending: "O selo espera o lab em que a chave passa no checker e o checkpoint.",
    seal: {
      badge: "SES",
      name: "Sessão",
      text: "A chave temporária ficou com HttpOnly, Secure e SameSite. No login ela troca. No logout o registro some.",
      tone: "defense",
    },
  },
  {
    ...authTrail,
    sealId: "selo-autenticacao",
    labUnitId: "auth-lab",
    checkpointId: "auth-checkpoint",
    units: authUnits,
    sealPending: "O selo espera o lab de login no checker e o checkpoint.",
    seal: {
      badge: "AUTH",
      name: "Autenticação",
      text: "Senha virou hash, login inválido ficou genérico, cadastro recusa senhas óbvias e tentativas falhas desaceleram.",
      tone: "accent",
    },
  },
  {
    ...xssTrail,
    sealId: "selo-xss",
    labUnitId: "xss-lab",
    checkpointId: "xss-checkpoint",
    units: xssUnits,
    sealPending: "O selo espera o lab do painel no checker e o checkpoint.",
    seal: {
      badge: "XSS",
      name: "XSS",
      text: "Saída codificada, CSP ativa, texto entra sem innerHTML perigoso e HTML rico passa por sanitizador.",
      tone: "defense",
    },
  },
  {
    ...csrfTrail,
    sealId: "selo-csrf",
    labUnitId: "csrf-lab",
    checkpointId: "csrf-checkpoint",
    units: csrfUnits,
    sealPending: "O selo espera o lab de transferência no checker e o checkpoint.",
    seal: {
      badge: "CSRF",
      name: "CSRF",
      text: "Token em mutações, SameSite no cookie, Origin conferido e estado só muda com POST protegido.",
      tone: "defense",
    },
  },
  {
    ...phishingTrail,
    sealId: "selo-phishing",
    labUnitId: "phishing-lab",
    checkpointId: "phishing-checkpoint",
    units: phishingUnits,
    sealPending: "O selo espera a caixa do lab classificada e o checkpoint.",
    seal: {
      badge: "PHI",
      name: "Phishing interno",
      text: "Você classificou a caixa fictícia e fechou políticas: sem senha por e-mail, aviso de login, 2FA e treino simulado para o time.",
      tone: "defense",
    },
  },
  {
    ...accessTrail,
    sealId: "selo-controle-acesso",
    units: accessUnits,
    labUnitId: "idor-lab",
    checkpointId: "idor-checkpoint",
    sealPending: "O selo espera a rota de pedidos fechada no checker e o checkpoint.",
    seal: {
      badge: "IDOR",
      name: "Controle de acesso",
      text: "A rota de pedidos filtra pelo dono da sessão, confere o papel no servidor, nasce fechada, ignora campos fora da lista e não devolve o pedido do Bruno.",
      tone: "accent",
    },
  },
];

export function isPublished(trail: Trail) {
  return trail.status !== "rascunho";
}

/** Trilhas que o aluno vê: início, perfil, time e “Próxima trilha” só contam estas. */
export const PUBLISHED_TRAILS = TRAILS.filter(isPublished);

export function trailBySlug(slug: string) {
  return TRAILS.find((trail) => trail.slug === slug) ?? null;
}

/** A próxima trilha publicada na ordem da spec (7.2), para o CTA “Próxima trilha” do selo. */
export function trailAfter(slug: string) {
  const index = TRAILS.findIndex((trail) => trail.slug === slug);
  if (index < 0) return null;
  return TRAILS.slice(index + 1).find(isPublished) ?? null;
}

export function locateUnit(id: string) {
  for (const trail of TRAILS) {
    const unit = trail.units.find((item) => item.id === id);
    if (unit) return { trail, unit };
  }
  return null;
}
