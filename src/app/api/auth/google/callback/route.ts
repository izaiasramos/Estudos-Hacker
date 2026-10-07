import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { redirectTo } from "@/lib/http";
import { createSessionToken, sessionCookie } from "@/lib/session";
import {
  createGoogleUser,
  findUserByEmail,
  findUserByGoogleSub,
} from "@/lib/users";

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function statesMatch(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    return redirectTo(request, "/entrar?erro=google-config");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const savedState = jar.get("shieldpath_oauth_state")?.value;
  if (!code || !state || !savedState || !statesMatch(state, savedState)) {
    return redirectTo(request, "/entrar?erro=google-estado");
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) {
    return redirectTo(request, "/entrar?erro=google-estado");
  }
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) {
    return redirectTo(request, "/entrar?erro=google-estado");
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) {
    return redirectTo(request, "/entrar?erro=google-estado");
  }
  const profile = (await profileResponse.json()) as GoogleProfile;
  if (!profile.sub || !profile.email || profile.email_verified === false) {
    return redirectTo(request, "/entrar?erro=google-estado");
  }

  const existingBySub = await findUserByGoogleSub(profile.sub);
  const existingByEmail = await findUserByEmail(profile.email);
  if (existingByEmail && existingByEmail.googleSub !== profile.sub) {
    return redirectTo(request, "/entrar?erro=google-conta");
  }

  const user =
    existingBySub ??
    (await createGoogleUser({
      email: profile.email,
      name: profile.name ?? "",
      sub: profile.sub,
    }));

  const cookie = sessionCookie(createSessionToken(user.id));
  const response = redirectTo(request, user.ethicsAcceptedAt ? "/inicio" : "/regras");
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  response.cookies.set("shieldpath_oauth_state", "", { path: "/", maxAge: 0 });
  return response;
}
