import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { stopLab } from "@/lib/lab-runtime";
import { clearSessionCookie, readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return redirectTo(request, "/?erro=origem");
  }
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (user) await stopLab(user.id);
  const cookie = clearSessionCookie();
  const response = redirectTo(request, "/");
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
