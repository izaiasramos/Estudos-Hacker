import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completeXssLab } from "@/lib/trail-progress";
import { findUserById } from "@/lib/users";
import { missingXssLabDefenses } from "@/lib/xss-lab-check";

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
  const missing = missingXssLabDefenses({
    escape: String(form.get("escape") ?? ""),
    csp: String(form.get("csp") ?? ""),
    safedom: String(form.get("safedom") ?? ""),
    sanitize: String(form.get("sanitize") ?? ""),
  });

  const destination = new URL("/trilha/xss/xss-lab", request.url);
  if (missing.length > 0) {
    destination.searchParams.set("falta", missing.join(","));
    return NextResponse.redirect(destination, 303);
  }

  const result = await completeXssLab(user.id, true);
  if ("error" in result) return redirectTo(request, "/trilha/xss");
  if (result.sealed) return redirectTo(request, "/trilha/xss/selo");
  destination.searchParams.set("ok", "1");
  return NextResponse.redirect(destination, 303);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
