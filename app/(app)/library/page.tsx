import type { Metadata } from "next";

import { AssetCard } from "@/components/library/asset-card";
import { CategoryStrip } from "@/components/library/category-strip";
import { LibraryEmptyState } from "@/components/library/library-empty-state";
import { LibraryFilters } from "@/components/library/library-filters";
import { Pagination } from "@/components/library/pagination";
import { getLibraryData, type LibrarySearchParams } from "@/lib/library-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library",
  description: "Browse scientific illustration assets on Imagiene.",
};

type LibraryPageProps = {
  searchParams: Promise<LibrarySearchParams>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const data = await getLibraryData({ searchParams: params });

  if (!data) {
    return null;
  }

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border bg-muted/30 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Asset Library
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Browse scientific illustration assets.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Search publication-ready icons, diagrams, vectors, PNGs, and SVGs.
            Bookmark assets for later or download what your plan unlocks.
          </p>
        </div>
        <CategoryStrip categories={data.categories} />
        <LibraryFilters query={data.query} />
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{data.total} published assets</p>
          <p>Free, Pro, and Premium access levels</p>
        </div>
        {data.assets.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <LibraryEmptyState />
        )}
        <Pagination
          basePath="/library"
          page={data.query.page}
          pageCount={data.pageCount}
          searchParams={params}
        />
      </section>
    </main>
  );
}
