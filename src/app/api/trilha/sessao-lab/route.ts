import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completeSessionLab } from "@/lib/trail-progress";
import { findUserById } from "@/lib/users";

const REQUIRED = ["httponly", "secure", "rotate", "logout"] as const;

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return redirectTo(request, "/inicio");
  }
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");
  if (!user.ethicsAcceptedAt) return redirectTo(request, "/regras");

  const form = await request.formData();
  const missing: string[] = REQUIRED.filter((key) => form.get(key) !== "on");
  const sameSite = String(form.get("samesite") ?? "");
  if (sameSite !== "lax" && sameSite !== "strict") missing.push("samesite");

  const destination = new URL("/trilha/sessao/sessao-lab", request.url);
  if (missing.length > 0) {
    destination.searchParams.set("falta", missing.join(","));
    return NextResponse.redirect(destination, 303);
  }

  const result = await completeSessionLab(user.id, true);
  if ("error" in result) return redirectTo(request, "/trilha/sessao");
  if (result.sealed) return redirectTo(request, "/trilha/sessao/selo");
  destination.searchParams.set("ok", "1");
  return NextResponse.redirect(destination, 303);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
