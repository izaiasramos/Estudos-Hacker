import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { reviewQueries } from "@/lib/lab-check";
import { sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completeLab } from "@/lib/trail-progress";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!user.ethicsAcceptedAt) return NextResponse.json({ ok: false }, { status: 403 });

  const form = await request.formData();
  const source = String(form.get("source") ?? "");
  const review = reviewQueries(source);
  if (!review.ok) {
    return NextResponse.json({ ok: true, passed: false, tests: review.tests, sealed: false });
  }

  const saved = await completeLab(user.id, true);
  if ("error" in saved) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  return NextResponse.json({
    ok: true,
    passed: true,
    tests: review.tests,
    sealed: saved.sealed,
  });
}
