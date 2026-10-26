import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";
import { missingUploadLabDefenses } from "@/lib/upload-lab-check";

const FIELDS = ["content", "rename", "size", "isolate", "svg", "contenttype"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "upload-lab", (form) => missingUploadLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
