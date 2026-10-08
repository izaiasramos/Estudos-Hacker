import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { cleanDisplayName, findUserById, updateUserName } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/perfil?erro=origem");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");

  const form = await request.formData();
  const name = cleanDisplayName(String(form.get("name") ?? ""));
  if (!name) return redirectTo(request, "/perfil?erro=nome");

  await updateUserName(user.id, name);
  return redirectTo(request, "/perfil?ok=nome");
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
