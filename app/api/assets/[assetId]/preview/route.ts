import { NextRequest } from "next/server";

import { apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getR2PreviewUrl, isExternalUrl } from "@/lib/r2";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type PreviewRouteContext = {
  params: Promise<{ assetId: string }>;
};

const PREVIEW_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Disposition": "inline",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function GET(_request: NextRequest, context: PreviewRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const user = await getCurrentUser();
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.assetId,
        deletedAt: null,
        OR: isAdmin(user) ? undefined : [{ isPublished: true }],
      },
      select: {
        previewUrl: true,
      },
    });

    if (!asset?.previewUrl) {
      return apiError("Asset preview not found", 404);
    }

    const sourceUrl = isExternalUrl(asset.previewUrl)
      ? asset.previewUrl
      : getR2PreviewUrl(asset.previewUrl);
    const upstream = await fetch(sourceUrl, { cache: "no-store" });

    if (!upstream.ok || !upstream.body) {
      return apiError("Asset preview not available", 404);
    }

    const headers = new Headers(PREVIEW_HEADERS);
    const contentType = upstream.headers.get("content-type");
    const contentLength = upstream.headers.get("content-length");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstream.body, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
