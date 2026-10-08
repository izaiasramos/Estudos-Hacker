import { missingPhishingLabDefenses } from "@/lib/phishing-lab-check";
import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";

const FIELDS = ["msg1", "msg2", "msg3", "nosenha", "alerta", "mfa", "treino"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "phishing-lab", (form) => missingPhishingLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
