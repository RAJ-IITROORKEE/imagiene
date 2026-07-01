import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import {
  createR2ObjectKey,
  getR2UploadUrl,
  requireR2Configured,
} from "@/lib/r2";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const r2UploadUrlSchema = z.object({
  purpose: z.enum(["asset", "preview"]),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(255).optional(),
});

export async function POST(request: NextRequest) {
  try {
    requireR2Configured();

    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:r2:${admin.id}`, {
      prefix: "api:admin-r2-upload-url",
      limit: 120,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const input = r2UploadUrlSchema.parse(await request.json());
    const key = createR2ObjectKey(input.purpose, input.fileName);
    const uploadUrl = getR2UploadUrl({
      key,
      purpose: input.purpose,
      contentType: input.contentType,
    });

    return ok({
      data: {
        key,
        uploadUrl,
        publicUrl: null,
        headers: input.contentType ? { "Content-Type": input.contentType } : {},
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("R2 credentials")) {
      return apiError(error.message, 500);
    }

    return handleApiError(error);
  }
}
