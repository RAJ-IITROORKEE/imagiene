import type { Metadata } from "next";

import { DashboardAssetRow } from "@/components/dashboard/dashboard-asset-row";
import { EmptyDashboardState } from "@/components/dashboard/empty-dashboard-state";
import { Pagination } from "@/components/library/pagination";
import { getDashboardDownloads, type DashboardSearchParams } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Your Imagiene download history.",
};

export const dynamic = "force-dynamic";

type DownloadsPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

export default async function DownloadsPage({ searchParams }: DownloadsPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getDashboardDownloads(resolvedSearchParams);

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Downloads</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Downloaded assets</h1>
          <p className="mt-3 text-muted-foreground">{data.total} downloads are available in your history.</p>
        </section>

        {data.downloads.length ? (
          <div className="space-y-4">
            {data.downloads.map((download) => (
              <DashboardAssetRow key={download.id} asset={download.asset} timestamp={download.createdAt} timestampLabel="Downloaded" />
            ))}
          </div>
        ) : (
          <EmptyDashboardState title="No downloads yet" description="Download unlocked assets to build a reusable record of scientific visuals." />
        )}

        <Pagination page={data.page} pageCount={data.pageCount} basePath="/dashboard/downloads" searchParams={resolvedSearchParams} />
      </div>
    </main>
  );
}
