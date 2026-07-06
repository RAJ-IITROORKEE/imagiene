import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { trackAssetShare } from "@/lib/asset-shares";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type AssetShareRouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function POST(request: NextRequest, context: AssetShareRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const body = (await request.json().catch(() => ({}))) as { channel?: string };
    const asset = await prisma.asset.findFirst({
      where: { id: params.assetId, isPublished: true, deletedAt: null },
      select: { id: true },
    });

    if (!asset) {
      return apiError("Asset not found", 404);
    }

    await trackAssetShare({ assetId: asset.id, channel: body.channel ?? "share" });

    return ok({ data: { shared: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
