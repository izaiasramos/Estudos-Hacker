import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { redirectTo, sameOrigin } from "@/lib/http";
import { startLab } from "@/lib/lab-runtime";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/admin/qa?erro=origem");
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return new Response("Not Found", { status: 404 });
  await startLab(actor!.id);
  console.info("[admin] simulação QA iniciada", { actorId: actor!.id });
  return redirectTo(request, "/lab/pizzaria?qa=1");
}

export function GET() { return Response.json({ ok: false }, { status: 405 }); }
