import { redirectTo } from "@/lib/http";
import { createOAuthState } from "@/lib/session";

export async function GET(request: Request) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  if (!clientId || !process.env.AUTH_GOOGLE_SECRET) {
    return redirectTo(request, "/entrar?erro=google-config");
  }

  const url = new URL(request.url);
  const state = createOAuthState();
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");

  const response = redirectTo(request, auth.toString());
  response.cookies.set("shieldpath_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
