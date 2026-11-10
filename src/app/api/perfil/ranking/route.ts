import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById, updateShowInRanking } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/perfil?erro=origem");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");
  const form = await request.formData();
  await updateShowInRanking(user.id, form.get("show") === "on");
  return redirectTo(request, "/perfil?ok=ranking#ranking");
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
