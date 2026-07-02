import { NextRequest } from "next/server";
import sharp from "sharp";

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
  "Content-Type": "image/webp",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

const PREVIEW_MAX_WIDTH = 1200;
const PREVIEW_WEBP_QUALITY = 58;

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

    const sourceBuffer = Buffer.from(await upstream.arrayBuffer());
    const previewBuffer = await sharp(sourceBuffer, { animated: false })
      .resize({ width: PREVIEW_MAX_WIDTH, withoutEnlargement: true })
      .webp({ effort: 4, quality: PREVIEW_WEBP_QUALITY })
      .toBuffer();

    const headers = new Headers(PREVIEW_HEADERS);
    headers.set("Content-Length", String(previewBuffer.length));

    return new Response(new Uint8Array(previewBuffer), { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
