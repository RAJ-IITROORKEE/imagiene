import { NextRequest } from "next/server";
import sharp from "sharp";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { getAssetAccessDecision, getAssetAccessMessage } from "@/lib/asset-access";
import {
  getCompressedDownloadFormat,
  getCompressedDownloadSize,
  type CompressedDownloadFormat,
  type DownloadVariant,
} from "@/lib/asset-download-options";
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

function parseDownloadRequest(input: unknown): {
  variant: DownloadVariant;
  format: ReturnType<typeof getCompressedDownloadFormat>;
  size: ReturnType<typeof getCompressedDownloadSize>;
} {
  const value = input && typeof input === "object" ? input : {};
  const variant = "variant" in value && value.variant === "compressed" ? "compressed" : "original";
  const format = "format" in value && typeof value.format === "string" ? value.format : null;
  const size = "size" in value && typeof value.size === "string" ? value.size : null;

  return {
    variant,
    format: getCompressedDownloadFormat(format),
    size: getCompressedDownloadSize(size),
  };
}

function downloadHeaders({
  asset,
  upstream,
  variant,
  format,
  sizeLabel,
  contentLength,
}: {
  asset: { slug: string; format: string };
  upstream: Response;
  variant: DownloadVariant;
  format?: ReturnType<typeof getCompressedDownloadFormat>;
  sizeLabel?: string;
  contentLength?: number;
}) {
  const extension = variant === "compressed" ? (format?.extension ?? "webp") : asset.format.toLowerCase();
  const suffix = variant === "compressed" && sizeLabel ? `-${sizeLabel.toLowerCase()}` : "";
  const headers = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": `attachment; filename="${asset.slug}${suffix}.${extension}"`,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
  const contentType = upstream.headers.get("content-type");

  headers.set("Content-Type", variant === "compressed" ? (format?.contentType ?? "image/webp") : contentType ?? "application/octet-stream");

  if (contentLength) {
    headers.set("Content-Length", String(contentLength));
  } else {
    const upstreamContentLength = upstream.headers.get("content-length");

    if (variant === "original" && upstreamContentLength) {
      headers.set("Content-Length", upstreamContentLength);
    }
  }

  return headers;
}

async function compressImage(
  buffer: Buffer,
  size: ReturnType<typeof getCompressedDownloadSize>,
  format: CompressedDownloadFormat,
) {
  const pipeline = sharp(buffer, { animated: true }).resize({ width: size.maxWidth, withoutEnlargement: true });

  if (format === "png") {
    return pipeline.png({ compressionLevel: 9, effort: 7 }).toBuffer();
  }

  if (format === "jpg") {
    return pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  }

  return pipeline.webp({ quality: 82, effort: 4 }).toBuffer();
}

export async function POST(request: NextRequest, context: DownloadRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const user = await requireCurrentUser();
    const input = parseDownloadRequest(await request.json().catch(() => ({})));
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
        downloadUrl: `/api/assets/${asset.id}/download?downloadId=${download.id}&variant=${input.variant}&size=${input.size.id}&format=${input.format.id}`,
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
    const variant = request.nextUrl.searchParams.get("variant") === "compressed" ? "compressed" : "original";
    const size = getCompressedDownloadSize(request.nextUrl.searchParams.get("size"));
    const format = getCompressedDownloadFormat(request.nextUrl.searchParams.get("format"));

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

    if (variant === "compressed") {
      const buffer = Buffer.from(await upstream.arrayBuffer());
      const compressed = await compressImage(buffer, size, format.id);

      return new Response(new Uint8Array(compressed), {
        headers: downloadHeaders({
          asset: download.asset,
          upstream,
          variant,
          format,
          sizeLabel: size.id,
          contentLength: compressed.byteLength,
        }),
      });
    }

    return new Response(upstream.body, {
      headers: downloadHeaders({ asset: download.asset, upstream, variant }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
