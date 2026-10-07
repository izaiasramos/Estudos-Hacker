import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { acceptEthics, findUserById, recordEthicsAttempt } from "@/lib/users";

const ANSWERS = {
  alvo: "lab",
  selo: "defesa",
} as const;

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return redirectTo(request, "/regras?erro=origem");
  }

  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) {
    return redirectTo(request, "/entrar");
  }
  if (user.ethicsAcceptedAt) {
    return redirectTo(request, "/inicio");
  }

  const form = await request.formData();
  const wrong: string[] = [];
  if (form.get("alvo") !== ANSWERS.alvo) wrong.push("alvo");
  if (form.get("selo") !== ANSWERS.selo) wrong.push("selo");
  if (form.get("aceite") !== "sim") wrong.push("aceite");

  if (wrong.length > 0) {
    await recordEthicsAttempt(user.id);
    return redirectTo(request, `/regras?err=${wrong.join(",")}`);
  }

  await acceptEthics(user.id);
  return redirectTo(request, "/inicio");
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
