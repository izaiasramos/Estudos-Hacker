import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { createSquad, joinSquad } from "@/lib/squad";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");
  if (!user.ethicsAcceptedAt) return redirectTo(request, "/regras");

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const result =
    intent === "entrar"
      ? await joinSquad(user.id, String(form.get("code") ?? ""))
      : await createSquad(user.id, String(form.get("name") ?? ""));
  if ("error" in result) return redirectTo(request, `/squad?erro=${result.error}`);
  return redirectTo(request, "/squad");
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
