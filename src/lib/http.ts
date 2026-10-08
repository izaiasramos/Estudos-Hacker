import { NextResponse } from "next/server";

export function sameOrigin(request: Request) {
  const requestHost = new URL(request.url).host;
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === requestHost;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === requestHost;
    } catch {
      return false;
    }
  }
  return false;
}

export function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
