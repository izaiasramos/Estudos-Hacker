import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { missingAuthLabDefenses } from "@/lib/auth-lab-check";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completeAuthLab } from "@/lib/trail-progress";
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
  const missing = missingAuthLabDefenses({
    hash: String(form.get("hash") ?? ""),
    generic: String(form.get("generic") ?? ""),
    policy: String(form.get("policy") ?? ""),
    limit: String(form.get("limit") ?? ""),
  });

  const destination = new URL("/trilha/autenticacao/auth-lab", request.url);
  if (missing.length > 0) {
    destination.searchParams.set("falta", missing.join(","));
    return NextResponse.redirect(destination, 303);
  }

  const result = await completeAuthLab(user.id, true);
  if ("error" in result) return redirectTo(request, "/trilha/autenticacao");
  if (result.sealed) return redirectTo(request, "/trilha/autenticacao/selo");
  destination.searchParams.set("ok", "1");
  return NextResponse.redirect(destination, 303);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
