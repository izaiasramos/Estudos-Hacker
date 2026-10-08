import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { locateUnit } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { markUnitRead } from "@/lib/trail-progress";
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
  const unitId = String(form.get("unit") ?? "");
  const located = locateUnit(unitId);
  if (!located || !canSeeTrail(user, located.trail)) return redirectTo(request, "/inicio");
  const result = await markUnitRead(user.id, unitId, true);
  if ("error" in result || !located) {
    return redirectTo(request, located ? `/trilha/${located.trail.slug}` : "/inicio");
  }
  return redirectTo(request, `/trilha/${located.trail.slug}/${unitId}#quiz`);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
