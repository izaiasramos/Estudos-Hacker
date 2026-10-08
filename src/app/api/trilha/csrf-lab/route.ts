import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { missingCsrfLabDefenses } from "@/lib/csrf-lab-check";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completeCsrfLab } from "@/lib/trail-progress";
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
  const missing = missingCsrfLabDefenses({
    token: String(form.get("token") ?? ""),
    origin: String(form.get("origin") ?? ""),
    postonly: String(form.get("postonly") ?? ""),
    samesite: String(form.get("samesite") ?? ""),
  });

  const destination = new URL("/trilha/csrf/csrf-lab", request.url);
  if (missing.length > 0) {
    destination.searchParams.set("falta", missing.join(","));
    return NextResponse.redirect(destination, 303);
  }

  const result = await completeCsrfLab(user.id, true);
  if ("error" in result) return redirectTo(request, "/trilha/csrf");
  if (result.sealed) return redirectTo(request, "/trilha/csrf/selo");
  destination.searchParams.set("ok", "1");
  return NextResponse.redirect(destination, 303);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
