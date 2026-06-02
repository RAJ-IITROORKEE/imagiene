import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { Pagination } from "@/components/library/pagination";
import type { AdminSearchParams } from "@/lib/admin-data";
import { getAdminAssets } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminAssetsPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

export default async function AdminAssetsPage({ searchParams }: AdminAssetsPageProps) {
  const params = await searchParams;
  const data = await getAdminAssets(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Assets" title="Manage scientific illustration assets" description="Create, edit, publish, unpublish, and soft-delete library assets." action={{ href: "/admin/assets/new", label: "New asset" }} />
        <AdminSearchForm placeholder="Search assets" defaultValue={data.query.q} status={data.query.status} showAssetStatus />
        <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="col-span-5">Asset</span>
            <span className="col-span-2">Access</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Activity</span>
            <span className="col-span-1 text-right">Edit</span>
          </div>
          <div className="divide-y">
            {data.assets.length ? data.assets.map((asset) => (
              <div key={asset.id} className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <p className="font-medium">{asset.title}</p>
                  <p className="text-sm text-muted-foreground">{asset.category.name} · {asset.type} · {formatDate(asset.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold md:col-span-2">{asset.accessLevel}</p>
                <p className="text-sm md:col-span-2">{asset.deletedAt ? "Deleted" : asset.isPublished ? "Published" : "Draft"}</p>
                <p className="text-sm text-muted-foreground md:col-span-2">{asset._count.downloads} downloads · {asset._count.bookmarks} bookmarks</p>
                <div className="md:col-span-1 md:text-right">
                  <Link href={`/admin/assets/${asset.id}`} className="text-sm font-semibold underline-offset-4 hover:underline">Edit</Link>
                </div>
              </div>
            )) : <p className="p-6 text-sm text-muted-foreground">No assets found.</p>}
          </div>
        </section>
        <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/assets" searchParams={params} />
      </div>
    </main>
  );
}
