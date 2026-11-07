import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { one } from "@/lib/db";

/** Entrega a foto de perfil só para quem está logado. Sempre como imagem, com nosniff. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (!readSessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return new Response(null, { status: 401 });
  }
  const { id } = await ctx.params;
  const row = await one<{ avatar: string | null }>("SELECT avatar FROM users WHERE id = ?", [id]);
  const match = row?.avatar?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) return new Response(null, { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "content-type": match[1],
      "cache-control": "private, max-age=3600",
      "x-content-type-options": "nosniff",
    },
  });
}
