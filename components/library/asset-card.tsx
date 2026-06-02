import Link from "next/link";

import { AssetActions } from "@/components/library/asset-actions";
import {
  assetAccessLevelLabels,
  assetTypeLabels,
} from "@/constants/asset-types";
import { getAssetAccessMessage } from "@/lib/asset-access";
import type { LibraryAsset } from "@/lib/library-data";

type AssetCardProps = {
  asset: LibraryAsset;
};

export function AssetCard({ asset }: AssetCardProps) {
  const accessMessage = getAssetAccessMessage(asset.access);

  return (
    <article className="group overflow-hidden rounded-3xl border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/library/${asset.id}`} className="block">
        <div
          className="aspect-[4/3] border-b bg-muted bg-cover bg-center"
          style={{ backgroundImage: `url(${asset.previewUrl})` }}
          aria-label={asset.title}
        />
      </Link>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span>{assetTypeLabels[asset.type]}</span>
            <span>{assetAccessLevelLabels[asset.accessLevel]}</span>
          </div>
          <Link href={`/library/${asset.id}`} className="mt-2 block text-lg font-semibold">
            {asset.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {asset.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Link href={`/library/category/${asset.category.slug}`} className="rounded-full border px-3 py-1 hover:bg-muted">
            {asset.category.name}
          </Link>
          <span className="rounded-full border px-3 py-1">{asset.downloadCount} downloads</span>
        </div>
        {accessMessage ? (
          <p className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            {accessMessage}
          </p>
        ) : null}
        <AssetActions
          assetId={asset.id}
          canDownload={asset.access.allowed}
          initialBookmarked={asset.bookmarked}
          accessMessage={accessMessage}
          requiredPlan={asset.access.requiredPlan}
        />
      </div>
    </article>
  );
}
