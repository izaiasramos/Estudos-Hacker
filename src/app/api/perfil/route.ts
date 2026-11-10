import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { readAvatarFile } from "@/lib/avatar";
import { validatePersonName } from "@/lib/person-name";
import { findUserById, updateUserAvatar, updateUserName } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/perfil?erro=origem");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");

  const form = await request.formData();
  if (form.get("avatar") instanceof File && (form.get("avatar") as File).size > 0) {
    const photo = await readAvatarFile(form.get("avatar"));
    if ("error" in photo) return redirectTo(request, `/perfil?erro=${photo.error}`);
    await updateUserAvatar(user.id, photo.dataUrl);
    if (!form.has("name")) return redirectTo(request, "/perfil?ok=foto");
  }
  const person = validatePersonName(String(form.get("name") ?? ""));
  if (!person.ok) return redirectTo(request, "/perfil?erro=nome");
  await updateUserName(user.id, person.name);
  return redirectTo(request, "/perfil?ok=nome");
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
