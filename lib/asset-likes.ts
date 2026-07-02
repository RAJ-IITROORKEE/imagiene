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

export async function countAssetLikes(assetId: string) {
  const result = (await prisma.$runCommandRaw({
    count: ASSET_LIKES_COLLECTION,
    query: { assetId },
  })) as MongoCountResult;

  return result.n ?? 0;
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
