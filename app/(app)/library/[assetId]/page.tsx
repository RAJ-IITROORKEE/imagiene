import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssetActions } from "@/components/library/asset-actions";
import {
  assetAccessLevelLabels,
  assetTypeLabels,
} from "@/constants/asset-types";
import { getAssetAccessDecision, getAssetAccessMessage } from "@/lib/asset-access";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AssetDetailPageProps = {
  params: Promise<{ assetId: string }>;
};

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
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

  const [bookmark, relatedAssets] = await Promise.all([
    user
      ? prisma.bookmark.findUnique({
          where: { userId_assetId: { userId: user.id, assetId: asset.id } },
          select: { id: true },
        })
      : null,
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

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl space-y-8">
        <Link href="/library" className="inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground">
          Back to library
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className="min-h-[360px] rounded-3xl border bg-muted bg-cover bg-center shadow-sm"
            style={{ backgroundImage: `url(${asset.previewUrl})` }}
            aria-label={asset.title}
          />
          <div className="rounded-3xl border bg-background p-8 shadow-sm sm:p-10">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>{assetTypeLabels[asset.type]}</span>
              <span>{assetAccessLevelLabels[asset.accessLevel]}</span>
              <span>{asset.format}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">{asset.title}</h1>
            <p className="mt-4 leading-8 text-muted-foreground">{asset.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Link href={`/library/category/${asset.category.slug}`} className="rounded-full border px-3 py-1 hover:bg-muted">
                {asset.category.name}
              </Link>
              <span className="rounded-full border px-3 py-1">{asset.downloadCount} downloads</span>
              {asset.width && asset.height ? (
                <span className="rounded-full border px-3 py-1">
                  {asset.width} x {asset.height}
                </span>
              ) : null}
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
            {accessMessage ? (
              <p className="mt-6 rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                {accessMessage}
              </p>
            ) : null}
            <div className="mt-6">
              <AssetActions
                assetId={asset.id}
                canDownload={access.allowed}
                initialBookmarked={Boolean(bookmark)}
                accessMessage={accessMessage}
                requiredPlan={access.requiredPlan}
              />
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
                    style={{ backgroundImage: `url(${related.previewUrl})` }}
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
