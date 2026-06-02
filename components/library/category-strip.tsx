import type { Category } from "@prisma/client";
import Link from "next/link";

type CategoryWithCount = Category & {
  _count?: { assets: number };
};

type CategoryStripProps = {
  categories: CategoryWithCount[];
  activeSlug?: string;
};

export function CategoryStrip({ categories, activeSlug }: CategoryStripProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Library categories">
      <Link
        href="/library"
        aria-current={!activeSlug ? "page" : undefined}
        className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
      >
        All categories
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/library/category/${category.slug}`}
          aria-current={activeSlug === category.slug ? "page" : undefined}
          className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
        >
          {category.name}
          {category._count ? ` (${category._count.assets})` : null}
        </Link>
      ))}
    </nav>
  );
}
