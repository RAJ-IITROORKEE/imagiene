import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { getAssetAccessDecision, getAssetAccessMessage } from "@/lib/asset-access";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2DownloadUrl, isExternalUrl } from "@/lib/r2";
import { checkRateLimit } from "@/lib/rate-limit";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type DownloadRouteContext = {
  params: Promise<{ assetId: string }>;
};

const DOWNLOAD_RECEIPT_TTL_MS = 10 * 60 * 1000;

function downloadHeaders(asset: { slug: string; format: string }, upstream: Response) {
  const headers = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": `attachment; filename="${asset.slug}.${asset.format.toLowerCase()}"`,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
  const contentType = upstream.headers.get("content-type");
  const contentLength = upstream.headers.get("content-length");

  headers.set("Content-Type", contentType ?? "application/octet-stream");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return headers;
}

export async function POST(_request: NextRequest, context: DownloadRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const user = await requireCurrentUser();
    const limited = await checkRateLimit(`download:${user.id}`, {
      prefix: "api:downloads",
      limit: 30,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id: params.assetId,
        isPublished: true,
        deletedAt: null,
      },
    });

    if (!asset) {
      return apiError("Asset not found", 404);
    }

    const access = getAssetAccessDecision(user, asset);

    if (!access.allowed) {
      return apiError(getAssetAccessMessage(access) ?? "Asset access denied", 403, access);
    }

    const [download] = await Promise.all([
      prisma.download.create({
        data: {
          userId: user.id,
          assetId: asset.id,
        },
      }),
      prisma.asset.update({
        where: { id: asset.id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    return ok({
      data: {
        downloadId: download.id,
        downloadUrl: `/api/assets/${asset.id}/download?downloadId=${download.id}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest, context: DownloadRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const user = await requireCurrentUser();
    const downloadId = request.nextUrl.searchParams.get("downloadId") ?? "";

    if (!downloadId) {
      return apiError("Download receipt is required", 400);
    }

    const download = await prisma.download.findFirst({
      where: {
        id: downloadId,
        userId: user.id,
        assetId: params.assetId,
        createdAt: { gte: new Date(Date.now() - DOWNLOAD_RECEIPT_TTL_MS) },
      },
      include: { asset: true },
    });

    if (!download?.asset || !download.asset.isPublished || download.asset.deletedAt) {
      return apiError("Download not found or expired", 404);
    }

    const access = getAssetAccessDecision(user, download.asset);

    if (!access.allowed) {
      return apiError(getAssetAccessMessage(access) ?? "Asset access denied", 403, access);
    }

    const sourceUrl = isExternalUrl(download.asset.fileUrl)
      ? download.asset.fileUrl
      : getR2DownloadUrl(download.asset.fileUrl);
    const upstream = await fetch(sourceUrl, { cache: "no-store" });

    if (!upstream.ok || !upstream.body) {
      return apiError("Asset file not available", 404);
    }

    return new Response(upstream.body, {
      headers: downloadHeaders(download.asset, upstream),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
