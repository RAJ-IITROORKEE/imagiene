import type { Category } from "@/lib/generated/prisma";
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
    <nav className="flex flex-wrap justify-center gap-2" aria-label="Library categories">
      <Link
        href="/library"
        aria-current={!activeSlug ? "page" : undefined}
        className="shrink-0 rounded-[var(--radius-full)] border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/library/category/${category.slug}`}
          aria-current={activeSlug === category.slug ? "page" : undefined}
          className="shrink-0 rounded-[var(--radius-full)] border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
        >
          {category.name}
          {category._count ? ` (${category._count.assets})` : null}
        </Link>
      ))}
    </nav>
  );
}
