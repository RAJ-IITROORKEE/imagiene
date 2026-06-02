import { prisma } from "@/lib/prisma";

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
