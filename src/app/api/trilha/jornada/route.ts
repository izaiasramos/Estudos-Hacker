import { cookies } from "next/headers";
import { trailBySlug } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { redirectTo, sameOrigin } from "@/lib/http";
import { setLearningPath } from "@/lib/learning-path";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const payload = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");
  if (!user.ethicsAcceptedAt) return redirectTo(request, "/regras");
  const form = await request.formData();
  const slug = String(form.get("trail") ?? ""); const level = String(form.get("level") ?? "");
  const trail = trailBySlug(slug);
  if (!trail || !canSeeTrail(user, trail)) return redirectTo(request, "/inicio");
  const result = await setLearningPath(user.id, slug, level);
  return redirectTo(request, `/trilha/${slug}${"error" in result ? "?erro=jornada" : ""}`);
}

export function GET() { return Response.json({ ok:false }, { status:405 }); }
