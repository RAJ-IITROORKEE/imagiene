import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import { createR2ObjectKey, getR2UploadUrl, requireR2Configured } from "@/lib/r2";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const r2UploadSchema = z.object({
  purpose: z.enum(["asset", "preview"]),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(255),
});

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
  try {
    requireR2Configured();

    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:r2-upload:${admin.id}`, {
      prefix: "api:admin-r2-upload",
      limit: 60,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("Upload file is required", 400);
    }

    const contentType = getFormString(formData, "contentType") ?? (file.type || "application/octet-stream");
    const input = r2UploadSchema.parse({
      purpose: getFormString(formData, "purpose"),
      fileName: getFormString(formData, "fileName") ?? file.name,
      contentType,
    });
    const key = createR2ObjectKey(input.purpose, input.fileName);
    const uploadUrl = getR2UploadUrl({
      key,
      purpose: input.purpose,
      contentType: input.contentType,
    });
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": input.contentType },
      body: new Uint8Array(await file.arrayBuffer()),
      cache: "no-store",
    });

    if (!uploadResponse.ok) {
      return apiError("Protected upload failed. Check R2 credentials and bucket permissions.", 502);
    }

    return ok({
      data: {
        key,
        publicUrl: null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("R2 credentials")) {
      return apiError(error.message, 500);
    }

    return handleApiError(error);
  }
}
