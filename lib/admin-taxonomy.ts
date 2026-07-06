import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

export async function resolveUniqueCategorySlug(name: string, categoryId?: string) {
  const baseSlug = createSlug(name) || "category";
  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.category.findFirst({
      where: {
        id: categoryId ? { not: categoryId } : undefined,
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
