import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { closeSquad } from "@/lib/squad";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");

  const result = await closeSquad(user.id);
  if ("error" in result) return redirectTo(request, `/squad?erro=${result.error}`);
  return redirectTo(request, "/squad");
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
