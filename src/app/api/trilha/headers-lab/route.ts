import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";
import { missingHeadersLabDefenses } from "@/lib/headers-lab-check";

const FIELDS = ["fields", "errors", "powered", "csp", "hsts", "nosniff", "frame"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "headers-lab", (form) => missingHeadersLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
