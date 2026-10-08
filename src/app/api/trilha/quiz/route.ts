import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { locateUnit } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { gradeUnit } from "@/lib/trail-progress";
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
  const { trail, unit } = located;

  const answers: Record<string, string> = {};
  for (const question of unit.questions) {
    answers[question.id] = String(form.get(question.id) ?? "");
  }

  const result = await gradeUnit(user.id, unitId, answers, true);
  if ("error" in result) {
    return redirectTo(request, `/trilha/${trail.slug}`);
  }

  if (result.passed && result.sealed) {
    return redirectTo(request, `/trilha/${trail.slug}/selo`);
  }

  const destination = new URL(`/trilha/${trail.slug}/${unitId}`, request.url);
  if (result.passed) {
    destination.searchParams.set("ok", String(result.score));
  } else {
    destination.searchParams.set(
      "resp",
      result.wrong.map((item) => `${item.id}~${encodeURIComponent(item.choice)}`).join(","),
    );
  }
  destination.hash = "quiz";
  return NextResponse.redirect(destination, 303);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
