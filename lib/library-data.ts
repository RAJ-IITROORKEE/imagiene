import type { AssetAccessLevel, AssetType, Prisma } from "@prisma/client";

import { ASSET_ACCESS_LEVELS, ASSET_TYPES } from "@/constants/asset-types";
import { getAssetAccessDecision } from "@/lib/asset-access";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SORT_VALUES = ["newest", "popular", "title"] as const;

export type LibrarySort = (typeof SORT_VALUES)[number];

export type LibraryQuery = {
  q?: string;
  type?: AssetType;
  accessLevel?: AssetAccessLevel;
  sort: LibrarySort;
  page: number;
  pageSize: number;
};

export type LibrarySearchParams = Record<string, string | string[] | undefined>;

function getParam(params: LibrarySearchParams, key: string) {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parseLibraryQuery(params: LibrarySearchParams): LibraryQuery {
  const type = getParam(params, "type");
  const accessLevel = getParam(params, "accessLevel");
  const sort = getParam(params, "sort");
  const q = getParam(params, "q")?.trim();

  return {
    q: q || undefined,
    type: ASSET_TYPES.includes(type as AssetType) ? (type as AssetType) : undefined,
    accessLevel: ASSET_ACCESS_LEVELS.includes(accessLevel as AssetAccessLevel)
      ? (accessLevel as AssetAccessLevel)
      : undefined,
    sort: SORT_VALUES.includes(sort as LibrarySort) ? (sort as LibrarySort) : "newest",
    page: getPositiveInteger(getParam(params, "page"), 1),
    pageSize: 24,
  };
}

export function toAssetOrderBy(sort: LibrarySort): Prisma.AssetOrderByWithRelationInput {
  if (sort === "popular") {
    return { downloadCount: "desc" };
  }

  if (sort === "title") {
    return { title: "asc" };
  }

  return { createdAt: "desc" };
}

export async function getLibraryData({
  searchParams,
  categorySlug,
}: {
  searchParams: LibrarySearchParams;
  categorySlug?: string;
}) {
  const query = parseLibraryQuery(searchParams);
  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null;

  if (categorySlug && !category) {
    return null;
  }

  const where: Prisma.AssetWhereInput = {
    isPublished: true,
    deletedAt: null,
    categoryId: category?.id,
    type: query.type,
    accessLevel: query.accessLevel,
    OR: query.q
      ? [
          { title: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
        ]
      : undefined,
  };
  const skip = (query.page - 1) * query.pageSize;

  const [user, categories, total, assets] = await Promise.all([
    getCurrentUser(),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: true } }),
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: toAssetOrderBy(query.sort),
      include: {
        category: true,
        tags: true,
      },
    }),
  ]);
  const bookmarks = user
    ? await prisma.bookmark.findMany({
        where: { userId: user.id, assetId: { in: assets.map((asset) => asset.id) } },
        select: { assetId: true },
      })
    : [];
  const bookmarkedAssetIds = new Set(bookmarks.map((bookmark) => bookmark.assetId));

  return {
    query,
    category,
    categories,
    total,
    pageCount: Math.ceil(total / query.pageSize),
    assets: assets.map((asset) => ({
      ...asset,
      access: getAssetAccessDecision(user, asset),
      bookmarked: bookmarkedAssetIds.has(asset.id),
    })),
  };
}

export type LibraryAsset = NonNullable<Awaited<ReturnType<typeof getLibraryData>>>["assets"][number];
