import { TRAIL as authTrail, UNITS as authUnits } from "@/content/autenticacao";
import { TRAIL as sqlTrail, UNITS as sqlUnits, type Unit } from "@/content/sql-injection";
import { TRAIL as sessionTrail, UNITS as sessionUnits } from "@/content/sessao";

export type Trail = {
  slug: string;
  title: string;
  summary: string;
  sealId: string;
  units: Unit[];
};

export const TRAILS: Trail[] = [
  { ...sqlTrail, sealId: "selo", units: sqlUnits },
  { ...sessionTrail, sealId: "selo-sessao", units: sessionUnits },
  { ...authTrail, sealId: "selo-autenticacao", units: authUnits },
];

export function trailBySlug(slug: string) {
  return TRAILS.find((trail) => trail.slug === slug) ?? null;
}

export function locateUnit(id: string) {
  for (const trail of TRAILS) {
    const unit = trail.units.find((item) => item.id === id);
    if (unit) return { trail, unit };
  }
  return null;
}
