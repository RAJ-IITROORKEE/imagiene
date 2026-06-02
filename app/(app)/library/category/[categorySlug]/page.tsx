import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssetCard } from "@/components/library/asset-card";
import { CategoryStrip } from "@/components/library/category-strip";
import { LibraryEmptyState } from "@/components/library/library-empty-state";
import { LibraryFilters } from "@/components/library/library-filters";
import { Pagination } from "@/components/library/pagination";
import { getLibraryData, type LibrarySearchParams } from "@/lib/library-data";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<LibrarySearchParams>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  return {
    title: `${categorySlug.replaceAll("-", " ")} Assets`,
    description: "Browse scientific illustration assets by category.",
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ categorySlug }, queryParams] = await Promise.all([params, searchParams]);
  const data = await getLibraryData({ searchParams: queryParams, categorySlug });

  if (!data) {
    notFound();
  }

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border bg-muted/30 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Category
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {data.category?.name}
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {data.category?.description ??
              "Browse published scientific assets in this category."}
          </p>
        </div>
        <CategoryStrip categories={data.categories} activeSlug={categorySlug} />
        <LibraryFilters query={data.query} />
        <div className="text-sm text-muted-foreground">{data.total} assets in this category</div>
        {data.assets.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <LibraryEmptyState
            title="No assets in this category"
            description="Try removing filters or browse the full library while this category grows."
          />
        )}
        <Pagination
          basePath={`/library/category/${categorySlug}`}
          page={data.query.page}
          pageCount={data.pageCount}
          searchParams={queryParams}
        />
      </section>
    </main>
  );
}
