import type { Metadata } from "next";
import { Search } from "lucide-react";

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
    <main className="bg-background">
      <section className="border-b bg-muted/35 px-4 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Browse 12,000+ Scientific Assets
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Icons, diagrams, vectors, and illustrations for research and publication
          </p>
          <form action="/library" className="mx-auto mt-8 flex max-w-2xl gap-2 rounded-[var(--radius-full)] border bg-card p-2 shadow-sm">
            <label className="relative block flex-1">
              <span className="sr-only">Search assets</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={data.query.q ?? ""}
                placeholder="Search virus icons, DNA, flowchart..."
                className="h-10 w-full rounded-[var(--radius-full)] bg-transparent pl-11 pr-3 text-sm outline-none"
              />
            </label>
            <button className="h-10 rounded-[var(--radius-full)] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Search
            </button>
          </form>
          <div className="mt-5">
            <CategoryStrip categories={data.categories} />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8 lg:px-12">
        <LibraryFilters query={data.query} />
        <div className="flex items-center justify-between gap-4 py-5 text-sm text-muted-foreground">
          <p>Showing {data.assets.length} of {data.total.toLocaleString("en-IN")} published assets</p>
          <p className="hidden sm:block">Free, Pro, and Premium access levels</p>
        </div>
        {data.assets.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
