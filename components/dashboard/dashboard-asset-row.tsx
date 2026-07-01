import Link from "next/link";

import { AssetActions } from "@/components/library/asset-actions";
import { assetAccessLevelLabels, assetTypeLabels } from "@/constants/asset-types";
import { getAssetAccessMessage } from "@/lib/asset-access";
import { getProtectedAssetPreviewUrl } from "@/lib/asset-preview";
import type { DashboardAsset } from "@/lib/dashboard-data";

type DashboardAssetRowProps = {
  asset: DashboardAsset;
  timestamp: Date;
  timestampLabel: string;
};

export function DashboardAssetRow({ asset, timestamp, timestampLabel }: DashboardAssetRowProps) {
  const accessMessage = getAssetAccessMessage(asset.access);

  return (
    <article className="grid gap-4 rounded-3xl border bg-background p-4 shadow-sm sm:grid-cols-[160px_1fr]">
      <Link href={`/library/${asset.id}`} className="block overflow-hidden rounded-2xl border bg-muted">
        <div
          className="aspect-[4/3] bg-cover bg-center"
          style={{ backgroundImage: `url(${getProtectedAssetPreviewUrl(asset.id)})` }}
          aria-label={asset.title}
        />
      </Link>
      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span>{assetTypeLabels[asset.type]}</span>
            <span>{assetAccessLevelLabels[asset.accessLevel]}</span>
            <span>{timestampLabel} {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(timestamp)}</span>
          </div>
          <Link href={`/library/${asset.id}`} className="mt-2 block text-lg font-semibold">
            {asset.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{asset.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Link href={`/library/category/${asset.category.slug}`} className="rounded-full border px-3 py-1 hover:bg-muted">
            {asset.category.name}
          </Link>
          <span className="rounded-full border px-3 py-1">{asset.downloadCount} downloads</span>
          {accessMessage ? <span className="rounded-full border px-3 py-1">{accessMessage}</span> : null}
        </div>
        <AssetActions
          assetId={asset.id}
          canDownload={asset.access.allowed}
          initialBookmarked={asset.bookmarked}
          accessMessage={accessMessage}
        />
      </div>
    </article>
  );
}
