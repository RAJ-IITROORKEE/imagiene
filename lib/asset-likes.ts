import { prisma } from "@/lib/prisma";

const ASSET_LIKES_COLLECTION = "AssetLike";

type MongoCountResult = {
  n?: number;
};

type MongoFindResult = {
  cursor?: {
    firstBatch?: unknown[];
  };
};

type MongoAggregateResult = {
  cursor?: {
    firstBatch?: Array<{ _id?: string; count?: number }>;
  };
};

export async function countAssetLikes(assetId: string) {
  const result = (await prisma.$runCommandRaw({
    count: ASSET_LIKES_COLLECTION,
    query: { assetId },
  })) as MongoCountResult;

  return result.n ?? 0;
}

export async function countAssetLikesForAssets(assetIds: string[]) {
  if (assetIds.length === 0) {
    return {} as Record<string, number>;
  }

  const result = (await prisma.$runCommandRaw({
    aggregate: ASSET_LIKES_COLLECTION,
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

export async function isAssetLikedByUser(userId: string, assetId: string) {
  const result = (await prisma.$runCommandRaw({
    find: ASSET_LIKES_COLLECTION,
    filter: { userId, assetId },
    limit: 1,
  })) as MongoFindResult;

  return Boolean(result.cursor?.firstBatch?.length);
}

export async function setAssetLike({
  userId,
  assetId,
  liked,
}: {
  userId: string;
  assetId: string;
  liked: boolean;
}) {
  if (liked) {
    const now = new Date();

    await prisma.$runCommandRaw({
      update: ASSET_LIKES_COLLECTION,
      updates: [
        {
          q: { userId, assetId },
          u: {
            $set: { userId, assetId, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      ],
    });
  } else {
    await prisma.$runCommandRaw({
      delete: ASSET_LIKES_COLLECTION,
      deletes: [{ q: { userId, assetId }, limit: 0 }],
    });
  }

  return {
    liked,
    likeCount: await countAssetLikes(assetId),
  };
}

export async function deleteAssetLikesForUser(userId: string) {
  await prisma.$runCommandRaw({
    delete: ASSET_LIKES_COLLECTION,
    deletes: [{ q: { userId }, limit: 0 }],
  });
}
