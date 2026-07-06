import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Download, Eye, Heart, ImageIcon, Pencil, Plus, Search, Share2 } from "lucide-react";

import { AdminAssetDeleteButton } from "@/components/admin/admin-asset-delete-button";
import { Pagination } from "@/components/library/pagination";
import { assetAccessLevelLabels } from "@/constants/asset-types";
import type { AdminSearchParams } from "@/lib/admin-data";
import { getAdminAssets } from "@/lib/admin-data";
import { getProtectedAssetPreviewUrl } from "@/lib/asset-preview";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminAssetsPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

function statusBadge(asset: { deletedAt: Date | null; isPublished: boolean }) {
  if (asset.deletedAt) {
    return "bg-destructive/10 text-destructive";
  }

  if (asset.isPublished) {
    return "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200";
  }

  return "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200";
}

function statusLabel(asset: { deletedAt: Date | null; isPublished: boolean }) {
  if (asset.deletedAt) {
    return "Flagged";
  }

  return asset.isPublished ? "Published" : "Draft";
}

function tierBadge(accessLevel: string) {
  if (accessLevel === "PREMIUM") {
    return "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200";
  }

  if (accessLevel === "PRO") {
    return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-cyan-100";
  }

  return "bg-muted text-muted-foreground";
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof ImageIcon; tone: string }) {
  return (
    <article className="flex items-center justify-between rounded-[var(--radius-lg)] border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
    </article>
  );
}

export default async function AdminAssetsPage({ searchParams }: AdminAssetsPageProps) {
  const params = await searchParams;
  const data = await getAdminAssets(params);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [totalAssets, pendingReview, publishedToday, flagged] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, isPublished: false } }),
    prisma.asset.count({ where: { deletedAt: null, isPublished: true, createdAt: { gte: startOfDay } } }),
    prisma.asset.count({ where: { deletedAt: { not: null } } }),
  ]);

  return (
    <main className="px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Admin workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight">Content Management</h1>
          </div>
          <form className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label className="relative block sm:w-72">
              <span className="sr-only">Search assets</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={data.query.q}
                placeholder="Search assets..."
                className="h-10 w-full rounded-[var(--radius-md)] border bg-card pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
            <select
              name="status"
              defaultValue={data.query.status ?? ""}
              className="h-10 rounded-[var(--radius-md)] border bg-card px-3 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button className="h-10 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Search
            </button>
            <Link href="/admin/assets/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Upload New Asset
            </Link>
          </form>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Assets" value={totalAssets} icon={ImageIcon} tone="bg-primary/10 text-primary dark:bg-primary/20 dark:text-cyan-100" />
          <StatCard label="Pending Review" value={pendingReview} icon={Clock3} tone="bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200" />
          <StatCard label="Published Today" value={publishedToday} icon={CheckCircle2} tone="bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200" />
          <StatCard label="Flagged" value={flagged} icon={AlertTriangle} tone="bg-destructive/10 text-destructive" />
        </section>

        <section className="overflow-hidden rounded-[var(--radius-lg)] border bg-card shadow-sm">
          <div className="border-b px-5 py-5">
            <h2 className="font-semibold">Asset Management</h2>
          </div>
          <div className="hidden grid-cols-[72px_1.15fr_0.82fr_0.58fr_0.68fr_0.9fr_0.72fr_136px] gap-5 border-b bg-muted/45 px-5 py-3 text-xs font-semibold text-muted-foreground md:grid">
            <span>Thumbnail</span>
            <span>Asset Name</span>
            <span>Category</span>
            <span>Tier</span>
            <span>Status</span>
            <span>Metrics</span>
            <span>Uploaded</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y">
            {data.assets.length ? data.assets.map((asset) => (
              <article key={asset.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-muted/35 md:grid-cols-[72px_1.15fr_0.82fr_0.58fr_0.68fr_0.9fr_0.72fr_136px] md:items-center md:gap-5">
                <div
                  className="h-14 w-14 rounded-[var(--radius-md)] border bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${getProtectedAssetPreviewUrl(asset.id)})` }}
                  aria-label={asset.title}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{asset.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground md:hidden">{asset.category.name} · {formatDate(asset.createdAt)}</p>
                </div>
                <p className="text-sm text-muted-foreground">{asset.category.name}</p>
                <p>
                  <span className={`rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-semibold ${tierBadge(asset.accessLevel)}`}>
                    {assetAccessLevelLabels[asset.accessLevel]}
                  </span>
                </p>
                <p>
                  <span className={`rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-semibold ${statusBadge(asset)}`}>
                    {statusLabel(asset)}
                  </span>
                </p>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5" />{asset._count.downloads.toLocaleString("en-IN")} downloads</span>
                  <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{asset.likeCount.toLocaleString("en-IN")} likes</span>
                  <span className="inline-flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5" />{asset.shareCount.toLocaleString("en-IN")} shares</span>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(asset.createdAt)}</p>
                <div className="flex items-center gap-2 md:justify-end">
                  <Link href={`/admin/assets/${asset.id}`} className="rounded-[var(--radius-sm)] p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Edit ${asset.title}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {asset.isPublished && !asset.deletedAt ? (
                    <Link href={`/library/${asset.id}`} className="rounded-[var(--radius-sm)] p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`View ${asset.title}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <AdminAssetDeleteButton assetId={asset.id} title={asset.title} disabled={Boolean(asset.deletedAt)} />
                </div>
              </article>
            )) : <p className="p-6 text-sm text-muted-foreground">No assets found.</p>}
          </div>
          <div className="flex flex-col gap-4 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {data.assets.length} of {data.total} assets</p>
            <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/assets" searchParams={params} />
          </div>
        </section>
      </div>
    </main>
  );
}
