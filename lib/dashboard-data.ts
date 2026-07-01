import { redirect } from "next/navigation";
import type { Asset, Bookmark, Category, Download, Payment, Subscription, Tag, User } from "@/lib/generated/prisma";

import { planById } from "@/constants/plans";
import { getAssetAccessDecision } from "@/lib/asset-access";
import { syncCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DashboardSearchParams = Record<string, string | string[] | undefined>;

const DASHBOARD_PAGE_SIZE = 12;

export type DashboardAsset = Asset & {
  category: Category;
  tags: Tag[];
  access: ReturnType<typeof getAssetAccessDecision>;
  bookmarked: boolean;
};

export type DashboardBookmark = Bookmark & {
  asset: DashboardAsset;
};

export type DashboardDownload = Download & {
  asset: DashboardAsset;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPage(searchParams: DashboardSearchParams) {
  const page = Number(getFirstParam(searchParams.page));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function requireDashboardUser() {
  const user = await syncCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return user;
}

function augmentAsset(user: User, asset: Asset & { category: Category; tags: Tag[] }, bookmarked: boolean): DashboardAsset {
  return {
    ...asset,
    access: getAssetAccessDecision(user, asset),
    bookmarked,
  };
}

export async function getDashboardOverviewData() {
  const user = await requireDashboardUser();
  const [bookmarkCount, downloadCount, activeSubscription, recentBookmarks, recentDownloads, recentPayments] =
    await Promise.all([
      prisma.bookmark.count({ where: { userId: user.id } }),
      prisma.download.count({ where: { userId: user.id } }),
      prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bookmark.findMany({
        where: { userId: user.id, asset: { is: { deletedAt: null } } },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { asset: { include: { category: true, tags: true } } },
      }),
      prisma.download.findMany({
        where: { userId: user.id, asset: { is: { deletedAt: null } } },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { asset: { include: { category: true, tags: true } } },
      }),
      prisma.payment.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const bookmarkedIds = new Set(recentBookmarks.map((bookmark) => bookmark.assetId));

  return {
    user,
    plan: planById[user.plan],
    stats: {
      bookmarks: bookmarkCount,
      downloads: downloadCount,
      payments: recentPayments.length,
    },
    subscription: activeSubscription,
    recentBookmarks: recentBookmarks.map((bookmark) => ({
      ...bookmark,
      asset: augmentAsset(user, bookmark.asset, true),
    })),
    recentDownloads: recentDownloads.map((download) => ({
      ...download,
      asset: augmentAsset(user, download.asset, bookmarkedIds.has(download.assetId)),
    })),
    recentPayments,
  };
}

export async function getDashboardBookmarks(searchParams: DashboardSearchParams) {
  const user = await requireDashboardUser();
  const page = getPage(searchParams);
  const skip = (page - 1) * DASHBOARD_PAGE_SIZE;
  const where = { userId: user.id, asset: { is: { deletedAt: null } } };
  const [total, bookmarks] = await Promise.all([
    prisma.bookmark.count({ where }),
    prisma.bookmark.findMany({
      where,
      skip,
      take: DASHBOARD_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { asset: { include: { category: true, tags: true } } },
    }),
  ]);

  return {
    user,
    page,
    pageSize: DASHBOARD_PAGE_SIZE,
    total,
    pageCount: Math.ceil(total / DASHBOARD_PAGE_SIZE),
    bookmarks: bookmarks.map((bookmark) => ({
      ...bookmark,
      asset: augmentAsset(user, bookmark.asset, true),
    })),
  };
}

export async function getDashboardDownloads(searchParams: DashboardSearchParams) {
  const user = await requireDashboardUser();
  const page = getPage(searchParams);
  const skip = (page - 1) * DASHBOARD_PAGE_SIZE;
  const where = { userId: user.id, asset: { is: { deletedAt: null } } };
  const [total, downloads] = await Promise.all([
    prisma.download.count({ where }),
    prisma.download.findMany({
      where,
      skip,
      take: DASHBOARD_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { asset: { include: { category: true, tags: true } } },
    }),
  ]);
  const bookmarkedAssets = await prisma.bookmark.findMany({
    where: {
      userId: user.id,
      assetId: { in: downloads.map((download) => download.assetId) },
    },
    select: { assetId: true },
  });
  const bookmarkedIds = new Set(bookmarkedAssets.map((bookmark) => bookmark.assetId));

  return {
    user,
    page,
    pageSize: DASHBOARD_PAGE_SIZE,
    total,
    pageCount: Math.ceil(total / DASHBOARD_PAGE_SIZE),
    downloads: downloads.map((download) => ({
      ...download,
      asset: augmentAsset(user, download.asset, bookmarkedIds.has(download.assetId)),
    })),
  };
}

export async function getDashboardBillingData() {
  const user = await requireDashboardUser();
  const [activeSubscription, subscriptions, payments] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    user,
    plan: planById[user.plan],
    activeSubscription,
    subscriptions,
    payments,
  };
}

export async function getDashboardSettingsData() {
  const user = await requireDashboardUser();

  return { user };
}

export type DashboardBillingPayment = Payment;
export type DashboardBillingSubscription = Subscription;
