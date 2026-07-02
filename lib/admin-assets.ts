import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

export async function getAssetAvailability({
  title,
  assetId,
}: {
  title: string;
  assetId?: string;
}) {
  const cleanTitle = title.trim();
  const slug = createSlug(cleanTitle);

  if (!cleanTitle || !slug) {
    return {
      slug,
      titleAvailable: false,
      slugAvailable: false,
    };
  }

  const [titleMatch, slugMatch] = await Promise.all([
    prisma.asset.findFirst({
      where: {
        id: assetId ? { not: assetId } : undefined,
        deletedAt: null,
        title: { equals: cleanTitle, mode: "insensitive" },
      },
      select: { id: true },
    }),
    prisma.asset.findFirst({
      where: {
        id: assetId ? { not: assetId } : undefined,
        slug,
      },
      select: { id: true },
    }),
  ]);

  return {
    slug: slugMatch ? await resolveUniqueAssetSlug(cleanTitle, assetId) : slug,
    titleAvailable: !titleMatch,
    slugAvailable: true,
  };
}

export async function validateAssetTitle(title: string, assetId?: string): Promise<string | null> {
  const cleanTitle = title.trim();
  const titleMatch = await prisma.asset.findFirst({
    where: {
      id: assetId ? { not: assetId } : undefined,
      deletedAt: null,
      title: { equals: cleanTitle, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (titleMatch) {
    return "An asset with this name already exists";
  }

  return null;
}

export async function resolveUniqueAssetSlug(title: string, assetId?: string) {
  const baseSlug = createSlug(title) || "asset";
  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.asset.findFirst({
      where: {
        id: assetId ? { not: assetId } : undefined,
        slug,
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function syncTagAssetLinks({
  assetId,
  previousTagIds,
  nextTagIds,
}: {
  assetId: string;
  previousTagIds: string[];
  nextTagIds: string[];
}) {
  const previous = new Set(previousTagIds);
  const next = new Set(nextTagIds);
  const changedTagIds = [...new Set([...previousTagIds, ...nextTagIds])];

  if (changedTagIds.length === 0) {
    return;
  }

  const tags = await prisma.tag.findMany({
    where: { id: { in: changedTagIds } },
    select: { id: true, assetIds: true },
  });

  await Promise.all(
    tags.map((tag) => {
      const assetIds = new Set(tag.assetIds);

      if (next.has(tag.id)) {
        assetIds.add(assetId);
      }

      if (!next.has(tag.id) && previous.has(tag.id)) {
        assetIds.delete(assetId);
      }

      return prisma.tag.update({
        where: { id: tag.id },
        data: { assetIds: [...assetIds] },
      });
    }),
  );
}

export async function validateAssetRelations(input: {
  categoryId?: string;
  tagIds?: string[];
}): Promise<string | null> {
  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      return "Category not found";
    }
  }

  if (input.tagIds?.length) {
    const tagCount = await prisma.tag.count({
      where: { id: { in: input.tagIds } },
    });

    if (tagCount !== new Set(input.tagIds).size) {
      return "One or more tags were not found";
    }
  }

  return null;
}
