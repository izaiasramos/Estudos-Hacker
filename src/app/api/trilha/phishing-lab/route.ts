import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { missingPhishingLabDefenses } from "@/lib/phishing-lab-check";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completePhishingLab } from "@/lib/trail-progress";
import { findUserById } from "@/lib/users";

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
  const missing = missingPhishingLabDefenses({
    msg1: String(form.get("msg1") ?? ""),
    msg2: String(form.get("msg2") ?? ""),
    msg3: String(form.get("msg3") ?? ""),
    nosenha: String(form.get("nosenha") ?? ""),
    alerta: String(form.get("alerta") ?? ""),
    mfa: String(form.get("mfa") ?? ""),
    treino: String(form.get("treino") ?? ""),
  });

  const destination = new URL("/trilha/phishing/phishing-lab", request.url);
  if (missing.length > 0) {
    destination.searchParams.set("falta", missing.join(","));
    return NextResponse.redirect(destination, 303);
  }

  const result = await completePhishingLab(user.id, true);
  if ("error" in result) return redirectTo(request, "/trilha/phishing");
  if (result.sealed) return redirectTo(request, "/trilha/phishing/selo");
  destination.searchParams.set("ok", "1");
  return NextResponse.redirect(destination, 303);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
