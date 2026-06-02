import type { Metadata } from "next";

import { DashboardAssetRow } from "@/components/dashboard/dashboard-asset-row";
import { EmptyDashboardState } from "@/components/dashboard/empty-dashboard-state";
import { Pagination } from "@/components/library/pagination";
import { getDashboardBookmarks, type DashboardSearchParams } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved Imagiene assets.",
};

export const dynamic = "force-dynamic";

type BookmarksPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getDashboardBookmarks(resolvedSearchParams);

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Bookmarks</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Saved scientific assets</h1>
          <p className="mt-3 text-muted-foreground">{data.total} saved assets across your Imagiene workspace.</p>
        </section>

        {data.bookmarks.length ? (
          <div className="space-y-4">
            {data.bookmarks.map((bookmark) => (
              <DashboardAssetRow key={bookmark.id} asset={bookmark.asset} timestamp={bookmark.createdAt} timestampLabel="Saved" />
            ))}
          </div>
        ) : (
          <EmptyDashboardState title="No bookmarks yet" description="Bookmark assets from the library to keep them close to your active research workflow." />
        )}

        <Pagination page={data.page} pageCount={data.pageCount} basePath="/dashboard/bookmarks" searchParams={resolvedSearchParams} />
      </div>
    </main>
  );
}
