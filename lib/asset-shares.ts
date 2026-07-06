import { prisma } from "@/lib/prisma";

const ASSET_SHARES_COLLECTION = "AssetShare";

type MongoAggregateResult = {
  cursor?: {
    firstBatch?: Array<{ _id?: string; count?: number }>;
  };
};

export async function countAssetSharesForAssets(assetIds: string[]) {
  if (assetIds.length === 0) {
    return {} as Record<string, number>;
  }

  const result = (await prisma.$runCommandRaw({
    aggregate: ASSET_SHARES_COLLECTION,
    pipeline: [
      { $match: { assetId: { $in: assetIds } } },
      { $group: { _id: "$assetId", count: { $sum: 1 } } },
    ],
    cursor: {},
  })) as MongoAggregateResult;

  return Object.fromEntries(
    (result.cursor?.firstBatch ?? []).map((item) => [item._id ?? "", item.count ?? 0]).filter(([assetId]) => assetId),
  );
}

export async function trackAssetShare({ assetId, channel }: { assetId: string; channel: string }) {
  await prisma.$runCommandRaw({
    insert: ASSET_SHARES_COLLECTION,
    documents: [
      {
        assetId,
        channel: channel.slice(0, 40),
        createdAt: new Date(),
      },
    ],
  });
}
