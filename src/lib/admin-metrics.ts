import type { Trail } from "@/content/trails";

/** Dia (AAAA-MM-DD) de 7 dias atrás, no formato de `users.last_study_on`. */
export function weekAgoDay(now = Date.now()) {
  return new Date(now - 7 * 86400000).toISOString().slice(0, 10);
}

/**
 * Funil por trilha (seção 19), calculado a partir de contagens agregadas por unidade.
 * Nenhum dado individual sai daqui: só quantas contas concluíram cada etapa.
 */
export type TrailFunnel = {
  slug: string;
  title: string;
  draft: boolean;
  started: number;
  /** Concluíram a unidade antes do lab (o "L4" da spec: pronto para defender). */
  beforeLab: number;
  labDone: number;
  sealed: number;
  /** Taxa central da tese: de quem chegou ao lab, quantos fecharam a defesa. Null sem base. */
  labRate: number | null;
};

export function trailFunnel(trail: Trail, doneByUnit: Map<string, number>): TrailFunnel {
  const ids = trail.units.map((unit) => unit.id);
  const labIndex = ids.indexOf(trail.labUnitId);
  const beforeId = labIndex > 0 ? ids[labIndex - 1] : null;
  const count = (id: string | null) => (id ? (doneByUnit.get(id) ?? 0) : 0);
  const beforeLab = count(beforeId);
  const labDone = count(trail.labUnitId);
  return {
    slug: trail.slug,
    title: trail.title,
    draft: trail.status === "rascunho",
    started: count(ids[0] ?? null),
    beforeLab,
    labDone,
    sealed: count(trail.sealId),
    labRate: beforeLab > 0 ? Math.round((Math.min(labDone, beforeLab) / beforeLab) * 100) : null,
  };
}
