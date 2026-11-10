import { PUBLISHED_TRAILS } from "@/content/trails";
import { many } from "@/lib/db";

export type RankingEntry = {
  userId: string;
  name: string;
  hasAvatar: boolean;
  xp: number;
  seals: number;
  position: number;
};

export type Ranking = {
  top: RankingEntry[];
  /** Posição da própria pessoa quando ela está fora do top. */
  me: RankingEntry | null;
  total: number;
};

export const RANKING_SIZE = 10;

type Row = {
  id: string;
  name: string;
  has_avatar: boolean;
  xp: number;
  seals: string | number;
  position: string | number;
  total: string | number;
};

/**
 * Ranking geral por XP. Desempate: mais selos, depois conta mais antiga.
 * Só entra quem já aceitou as regras e não desligou "aparecer no ranking" no perfil.
 */
export async function getRanking(currentUserId: string): Promise<Ranking> {
  const sealIds = PUBLISHED_TRAILS.map((trail) => trail.sealId);
  const rows = await many<Row>(
    `WITH ranked AS (
       SELECT u.id, u.name, (u.avatar IS NOT NULL) AS has_avatar, u.xp,
              COALESCE(s.seals, 0) AS seals,
              ROW_NUMBER() OVER (
                ORDER BY u.xp DESC, COALESCE(s.seals, 0) DESC, u.created_at ASC, u.id ASC
              ) AS position,
              COUNT(*) OVER () AS total
       FROM users u
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS seals
         FROM progress
         WHERE status = 'done' AND unit_id = ANY(?)
         GROUP BY user_id
       ) s ON s.user_id = u.id
       WHERE u.ethics_accepted_at IS NOT NULL AND u.show_in_ranking
     )
     SELECT * FROM ranked WHERE position <= ? OR id = ? ORDER BY position`,
    [sealIds, RANKING_SIZE, currentUserId],
  );
  const entries: RankingEntry[] = rows.map((row) => ({
    userId: row.id,
    name: row.name,
    hasAvatar: row.has_avatar === true,
    xp: Number(row.xp),
    seals: Number(row.seals),
    position: Number(row.position),
  }));
  return {
    top: entries.filter((entry) => entry.position <= RANKING_SIZE),
    me: entries.find((entry) => entry.userId === currentUserId && entry.position > RANKING_SIZE) ?? null,
    total: rows.length ? Number(rows[0].total) : 0,
  };
}
