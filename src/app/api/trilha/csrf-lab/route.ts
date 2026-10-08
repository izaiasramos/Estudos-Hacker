import { missingCsrfLabDefenses } from "@/lib/csrf-lab-check";
import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";

const FIELDS = ["token", "origin", "postonly", "samesite"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "csrf-lab", (form) => missingCsrfLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
