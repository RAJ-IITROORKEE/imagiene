import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileImage, Gauge, Heart, ImageIcon, ShieldCheck } from "lucide-react";

import { AssetDetailPreview } from "@/components/library/asset-detail-preview";
import { AssetActions } from "@/components/library/asset-actions";
import {
  assetAccessLevelLabels,
  assetTypeLabels,
} from "@/constants/asset-types";
import { getAssetAccessDecision, getAssetAccessMessage } from "@/lib/asset-access";
import { compressedDownloadSizes, scaledDimensions } from "@/lib/asset-download-options";
import { countAssetLikes, isAssetLikedByUser } from "@/lib/asset-likes";
import { getProtectedAssetPreviewUrl } from "@/lib/asset-preview";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AssetDetailPageProps = {
  params: Promise<{ assetId: string }>;
};

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) {
    return "Not available";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 1024 * 100 ? 1 : 0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDimensions(width?: number | null, height?: number | null) {
  if (!width || !height) {
    return "Not available";
  }

  return `${width} x ${height}`;
}

async function getAsset(identifier: string) {
  const where = isObjectId(identifier) ? { id: identifier } : { slug: identifier };

  return prisma.asset.findFirst({
    where: {
      ...where,
      isPublished: true,
      deletedAt: null,
    },
    include: {
      category: true,
      tags: true,
    },
  });
}

export async function generateMetadata({ params }: AssetDetailPageProps): Promise<Metadata> {
  const { assetId } = await params;
  const asset = await getAsset(assetId);

  if (!asset) {
    return { title: "Asset" };
  }

  return {
    title: asset.title,
    description: asset.description,
  };
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { assetId } = await params;
  const [user, asset] = await Promise.all([getCurrentUser(), getAsset(assetId)]);

  if (!asset) {
    notFound();
  }

  const [bookmark, likeCount, liked, relatedAssets] = await Promise.all([
    user
      ? prisma.bookmark.findUnique({
          where: { userId_assetId: { userId: user.id, assetId: asset.id } },
          select: { id: true },
        })
      : null,
    countAssetLikes(asset.id),
    user ? isAssetLikedByUser(user.id, asset.id) : false,
    prisma.asset.findMany({
      where: {
        id: { not: asset.id },
        categoryId: asset.categoryId,
        isPublished: true,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { category: true, tags: true },
    }),
  ]);
  const access = getAssetAccessDecision(user, asset);
  const accessMessage = getAssetAccessMessage(access);
  const previewUrl = getProtectedAssetPreviewUrl(asset.id);
  const originalDimensions = formatDimensions(asset.width, asset.height);
  const originalFileSize = formatFileSize(asset.fileSize);
  const compressedOptions = compressedDownloadSizes.map((option) => ({
    ...option,
    dimensions: (() => {
      const dimensions = scaledDimensions({ width: asset.width, height: asset.height, maxWidth: option.maxWidth });

      return dimensions ? formatDimensions(dimensions.width, dimensions.height) : `${option.maxWidth}px wide`;
    })(),
  }));
  const metadataDetails = [
    { label: "File size", value: originalFileSize },
    { label: "Dimensions", value: originalDimensions },
    { label: "Format", value: asset.format.toUpperCase() },
    { label: "Type", value: assetTypeLabels[asset.type] },
    { label: "Access", value: assetAccessLevelLabels[asset.accessLevel] },
    { label: "Downloads", value: asset.downloadCount.toLocaleString() },
    { label: "Likes", value: likeCount.toLocaleString() },
    { label: "Category", value: asset.category.name },
  ];

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start">
          <AssetDetailPreview title={asset.title} previewUrl={previewUrl} details={metadataDetails} />

          <div className="space-y-5">
            <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border px-3 py-1">{assetTypeLabels[asset.type]}</span>
                <span className="rounded-full border px-3 py-1">{assetAccessLevelLabels[asset.accessLevel]}</span>
                <span className="rounded-full border px-3 py-1">{asset.format.toUpperCase()}</span>
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{asset.title}</h1>
              <p className="mt-4 leading-8 text-muted-foreground">{asset.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1rem] border bg-muted/25 p-4">
                  <FileImage className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">File size</p>
                  <p className="mt-1 font-semibold">{originalFileSize}</p>
                </div>
                <div className="rounded-[1rem] border bg-muted/25 p-4">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Dimensions</p>
                  <p className="mt-1 font-semibold">{originalDimensions}</p>
                </div>
                <div className="rounded-[1rem] border bg-muted/25 p-4">
                  <Heart className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Likes</p>
                  <p className="mt-1 font-semibold">{likeCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Link href={`/library/category/${asset.category.slug}`} className="rounded-full border px-3 py-1 hover:bg-muted">
                  {asset.category.name}
                </Link>
                <span className="rounded-full border px-3 py-1">{asset.downloadCount.toLocaleString()} downloads</span>
                <span className="rounded-full border px-3 py-1">Protected preview</span>
              </div>
              {asset.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span key={tag.id} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border bg-background p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3 rounded-[1.25rem] border bg-muted/35 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Protected image access</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Original files are delivered through the system. Choose original quality or a compressed WebP download.
                  </p>
                </div>
              </div>
              {accessMessage ? (
                <p className="mb-5 rounded-[1.25rem] border bg-muted/40 p-4 text-sm text-muted-foreground">
                  {accessMessage}
                </p>
              ) : null}
              <AssetActions
                assetId={asset.id}
                title={asset.title}
                accessLevel={asset.accessLevel}
                canDownload={access.allowed}
                initialBookmarked={Boolean(bookmark)}
                initialLiked={liked}
                initialLikeCount={likeCount}
                accessMessage={accessMessage}
                originalFileSize={originalFileSize}
                originalDimensions={originalDimensions}
                originalFormat={asset.format.toUpperCase()}
                compressedOptions={compressedOptions}
              />
            </div>

            <div className="rounded-[2rem] border bg-muted/25 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Available download formats</h2>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between gap-4 rounded-[1rem] border bg-background p-4">
                  <div>
                    <p className="font-semibold">Original quality</p>
                    <p className="mt-1 text-sm text-muted-foreground">{asset.format.toUpperCase()} · {originalDimensions}</p>
                  </div>
                  <Download className="h-5 w-5 text-primary" />
                </div>
                {compressedOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between gap-4 rounded-[1rem] border bg-background p-4">
                    <div>
                      <p className="font-semibold">Compressed {option.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">WebP · {option.dimensions}</p>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{option.maxWidth}px</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {relatedAssets.length > 0 ? (
          <div className="rounded-3xl border bg-muted/20 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">More from {asset.category.name}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedAssets.map((related) => (
                <Link key={related.id} href={`/library/${related.id}`} className="rounded-2xl border bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div
                    className="aspect-[4/3] rounded-xl bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${getProtectedAssetPreviewUrl(related.id)})` }}
                    aria-label={related.title}
                  />
                  <p className="mt-3 font-semibold">{related.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {assetAccessLevelLabels[related.accessLevel]}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
