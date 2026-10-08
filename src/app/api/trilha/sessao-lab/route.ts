import { handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";

const REQUIRED = ["httponly", "secure", "rotate", "logout"] as const;

function missingSessionDefenses(form: FormData) {
  const missing: string[] = REQUIRED.filter((key) => form.get(key) !== "on");
  const sameSite = String(form.get("samesite") ?? "");
  if (sameSite !== "lax" && sameSite !== "strict") missing.push("samesite");
  return missing;
}

export function POST(request: Request) {
  return handleChecklistLab(request, "sessao-lab", missingSessionDefenses);
}

export const GET = methodNotAllowed;
