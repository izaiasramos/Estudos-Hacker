import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { redirectTo, sameOrigin } from "@/lib/http";
import { stopLabById } from "@/lib/lab-runtime";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/admin?erro=origem");
  const user = await getCurrentUser();
  // Mesmo 404 da página: quem não é admin não descobre que a rota existe.
  if (!isAdmin(user)) return new Response("Not Found", { status: 404 });

  const form = await request.formData();
  const sessionId = String(form.get("session") ?? "");
  const stopped = sessionId ? await stopLabById(sessionId) : false;
  console.info("[admin] lab derrubado", { by: user?.id, sessionId, stopped });
  return redirectTo(request, stopped ? "/admin?ok=lab#labs" : "/admin?erro=lab#labs");
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
