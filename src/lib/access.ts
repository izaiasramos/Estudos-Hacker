import { isPublished, type Trail } from "@/content/trails";

type WithRole = { role: string } | null | undefined;

export function isAdmin(user: WithRole) {
  return user?.role === "admin";
}

/** Rascunho só existe para admin. Para todo o resto, a trilha não existe (404, não 403). */
export function canSeeTrail(user: WithRole, trail: Trail) {
  return isPublished(trail) || isAdmin(user);
}
