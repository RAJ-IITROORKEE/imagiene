import Link from "next/link";
import { Bookmark } from "lucide-react";

import {
  assetAccessLevelLabels,
} from "@/constants/asset-types";
import { getProtectedAssetPreviewUrl } from "@/lib/asset-preview";
import type { LibraryAsset } from "@/lib/library-data";

type AssetCardProps = {
  asset: LibraryAsset;
};

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-lg)] border bg-card shadow-sm transition-colors hover:border-primary/40">
      <Link href={`/library/${asset.id}`} className="block p-2">
        <div className="relative overflow-hidden rounded-[var(--radius-md)] bg-muted">
          <span className="absolute left-2 top-2 z-10 rounded-[var(--radius-full)] bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
            {assetAccessLevelLabels[asset.accessLevel]}
          </span>
          <span className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-background/95 text-foreground shadow-sm">
            <Bookmark className="h-4 w-4" fill={asset.bookmarked ? "currentColor" : "none"} />
          </span>
          <div
            className="aspect-[4/3] bg-muted bg-cover bg-center"
            style={{ backgroundImage: `url(${getProtectedAssetPreviewUrl(asset.id)})` }}
            aria-label={asset.title}
          />
        </div>
      </Link>
      <div className="px-4 pb-4 pt-2">
        <Link href={`/library/${asset.id}`} className="block truncate text-sm font-semibold">
          {asset.title}
        </Link>
        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <Link href={`/library/category/${asset.category.slug}`} className="truncate hover:text-foreground">
            {asset.category.name}
          </Link>
          <span>{asset.downloadCount} downloads</span>
        </div>
      </div>
    </article>
  );
}
