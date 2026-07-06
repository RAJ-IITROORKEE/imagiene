import type { Prisma } from "@/lib/generated/prisma";

import { requireAdmin } from "@/lib/admin";
import { countAssetLikesForAssets } from "@/lib/asset-likes";
import { countAssetSharesForAssets } from "@/lib/asset-shares";
import { countContactMessages, getRecentContactMessages, listContactMessages } from "@/lib/contact-messages";
import { getRuntimePlans } from "@/lib/plan-settings";
import { prisma } from "@/lib/prisma";

export type AdminSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 20;
const USER_SORT_FIELDS = ["name", "email", "role", "plan", "createdAt", "updatedAt"] as const;

type UserSortField = (typeof USER_SORT_FIELDS)[number];
type SortDirection = "asc" | "desc";

function firstParam(params: AdminSearchParams, key: string): string | undefined {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function pageParam(params: AdminSearchParams): number {
  const value = Number(firstParam(params, "page") ?? "1");
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function pageSizeParam(params: AdminSearchParams): number {
  const value = Number(firstParam(params, "pageSize") ?? String(DEFAULT_PAGE_SIZE));

  return Number.isInteger(value) && value >= 5 && value <= 100 ? value : DEFAULT_PAGE_SIZE;
}

function sortDirectionParam(params: AdminSearchParams): SortDirection {
  return firstParam(params, "dir") === "asc" ? "asc" : "desc";
}

function userSortParam(params: AdminSearchParams): UserSortField {
  const value = firstParam(params, "sort");

  return USER_SORT_FIELDS.includes(value as UserSortField) ? (value as UserSortField) : "createdAt";
}

function cleanParam(params: AdminSearchParams, key: string): string | undefined {
  const value = firstParam(params, key)?.trim();
  return value ? value : undefined;
}

export async function getAdminAnalyticsData() {
  await requireAdmin();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const monthStarts = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (5 - index));

    return date;
  });

  const [
    userCount,
    activeUserCount,
    todayUserCount,
    assetCount,
    publishedAssetCount,
    draftAssetCount,
    categoryCount,
    tagCount,
    bookmarkCount,
    downloadCount,
    activeSubscriptionCount,
    paidPaymentCount,
    revenue,
    recentPayments,
    popularAssets,
    recentUsers,
    planGroups,
    assetTypeGroups,
    recentDownloads,
    recentContacts,
    unreadContactCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.asset.count({ where: { deletedAt: null, isPublished: false } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.bookmark.count(),
    prisma.download.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true },
    }),
    prisma.asset.findMany({
      where: { deletedAt: null },
      orderBy: { downloadCount: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { _count: { select: { downloads: true, bookmarks: true, payments: true } } },
    }),
    prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.asset.groupBy({
      by: ["type"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.download.findMany({
      where: { createdAt: { gte: monthStarts[0] } },
      select: { createdAt: true },
    }),
    getRecentContactMessages(4),
    countContactMessages("NEW"),
  ]);

  const downloadTrend = monthStarts.map((start, index) => {
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return {
      label: start.toLocaleString("en-IN", { month: "short" }),
      value: recentDownloads.filter((download) => download.createdAt >= start && download.createdAt < end).length,
      isCurrent: index === monthStarts.length - 1,
    };
  });

  return {
    counts: {
      users: userCount,
      activeUsers: activeUserCount,
      usersToday: todayUserCount,
      assets: assetCount,
      publishedAssets: publishedAssetCount,
      draftAssets: draftAssetCount,
      categories: categoryCount,
      tags: tagCount,
      bookmarks: bookmarkCount,
      downloads: downloadCount,
      activeSubscriptions: activeSubscriptionCount,
      paidPayments: paidPaymentCount,
      unreadContacts: unreadContactCount,
    },
    revenuePaise: revenue._sum.amount ?? 0,
    recentPayments,
    popularAssets,
    recentUsers,
    recentContacts,
    planBreakdown: planGroups.map((group) => ({ label: group.plan, value: group._count._all })),
    assetTypeBreakdown: assetTypeGroups.map((group) => ({ label: group.type, value: group._count._all })),
    downloadTrend,
  };
}

export async function getAdminContactMessages(params: AdminSearchParams) {
  await requireAdmin();

  const page = pageParam(params);
  const q = cleanParam(params, "q");
  const status = cleanParam(params, "status");
  const normalizedStatus = status === "NEW" || status === "READ" || status === "RESOLVED" ? status : undefined;
  const [{ total, messages }, unreadCount] = await Promise.all([
    listContactMessages({ q, status: normalizedStatus, page, pageSize: DEFAULT_PAGE_SIZE }),
    countContactMessages("NEW"),
  ]);

  return {
    messages,
    unreadCount,
    page,
    total,
    pageCount: Math.ceil(total / DEFAULT_PAGE_SIZE),
    query: { q, status },
  };
}

export async function getAdminAssets(params: AdminSearchParams) {
  await requireAdmin();

  const page = pageParam(params);
  const q = cleanParam(params, "q");
  const status = cleanParam(params, "status");
  const includeDeleted = firstParam(params, "includeDeleted") === "true";
  const where: Prisma.AssetWhereInput = {
    deletedAt: includeDeleted ? undefined : null,
    isPublished: status === "published" ? true : status === "draft" ? false : undefined,
    OR: q
      ? [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  };
  const skip = (page - 1) * DEFAULT_PAGE_SIZE;
  const [total, assets] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      skip,
      take: DEFAULT_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: true,
        _count: { select: { bookmarks: true, downloads: true } },
      },
    }),
  ]);
  const assetIds = assets.map((asset) => asset.id);
  const [likeCounts, shareCounts] = await Promise.all([
    countAssetLikesForAssets(assetIds),
    countAssetSharesForAssets(assetIds),
  ]);

  return {
    assets: assets.map((asset) => ({
      ...asset,
      likeCount: likeCounts[asset.id] ?? 0,
      shareCount: shareCounts[asset.id] ?? 0,
    })),
    page,
    total,
    pageCount: Math.ceil(total / DEFAULT_PAGE_SIZE),
    query: { q, status, includeDeleted },
  };
}

export async function getAdminAssetFormData(assetId?: string) {
  await requireAdmin();

  const [categories, tags, asset] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    assetId
      ? prisma.asset.findUnique({
          where: { id: assetId },
          include: { category: true, tags: true },
        })
      : Promise.resolve(null),
  ]);

  return { categories, tags, asset };
}

export async function getAdminCategoriesData() {
  await requireAdmin();

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    }),
  ]);

  return { categories, tags };
}

export async function getAdminUsers(params: AdminSearchParams) {
  await requireAdmin();

  const page = pageParam(params);
  const pageSize = pageSizeParam(params);
  const q = cleanParam(params, "q");
  const sort = userSortParam(params);
  const dir = sortDirectionParam(params);
  const where: Prisma.UserWhereInput = {
    OR: q
      ? [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  };
  const skip = (page - 1) * pageSize;
  const [total, users, totalUsers, activeUsers, adminUsers, paidUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sort]: dir },
      include: { _count: { select: { bookmarks: true, downloads: true, payments: true } } },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { plan: { in: ["PRO", "PREMIUM"] } } }),
  ]);

  return {
    users,
    stats: {
      totalUsers,
      activeUsers,
      adminUsers,
      paidUsers,
    },
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
    query: { q, sort, dir },
  };
}

export async function getAdminUser(userId: string) {
  await requireAdmin();

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 10 },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { bookmarks: true, downloads: true } },
    },
  });
}

export async function getAdminSubscriptions(params: AdminSearchParams) {
  await requireAdmin();

  const page = pageParam(params);
  const q = cleanParam(params, "q");
  const userIds = q
    ? (
        await prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true },
        })
      ).map((user) => user.id)
    : undefined;
  const where: Prisma.SubscriptionWhereInput = { userId: userIds ? { in: userIds } : undefined };
  const skip = (page - 1) * DEFAULT_PAGE_SIZE;
  const [total, subscriptions] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      skip,
      take: DEFAULT_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  return { subscriptions, total, page, pageCount: Math.ceil(total / DEFAULT_PAGE_SIZE), query: { q } };
}

export async function getAdminPayments(params: AdminSearchParams) {
  await requireAdmin();

  const page = pageParam(params);
  const q = cleanParam(params, "q");
  const userIds = q
    ? (
        await prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true },
        })
      ).map((user) => user.id)
    : undefined;
  const where: Prisma.PaymentWhereInput = { userId: userIds ? { in: userIds } : undefined };
  const skip = (page - 1) * DEFAULT_PAGE_SIZE;
  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: DEFAULT_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  return { payments, total, page, pageCount: Math.ceil(total / DEFAULT_PAGE_SIZE), query: { q } };
}

export async function getAdminSettingsData() {
  const admin = await requireAdmin();
  const plans = await getRuntimePlans();

  return {
    admin,
    plans,
    env: {
      database: Boolean(process.env.DATABASE_URL),
      clerk: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
      clerkWebhook: Boolean(process.env.CLERK_WEBHOOK_SECRET),
      razorpay: Boolean(
        (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID) &&
          process.env.RAZORPAY_KEY_ID &&
          process.env.RAZORPAY_KEY_SECRET,
      ),
      razorpayWebhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      r2: Boolean(
        process.env.R2_ACCOUNT_ID &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY &&
          process.env.R2_PRIVATE_BUCKET_NAME,
      ),
      redis: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    },
  };
}

export type AdminAssetListItem = Awaited<ReturnType<typeof getAdminAssets>>["assets"][number];
export type AdminAssetFormRecord = NonNullable<Awaited<ReturnType<typeof getAdminAssetFormData>>["asset"]>;
export type AdminCategoryRecord = Awaited<ReturnType<typeof getAdminCategoriesData>>["categories"][number];
export type AdminTagRecord = Awaited<ReturnType<typeof getAdminCategoriesData>>["tags"][number];
export type AdminUserListItem = Awaited<ReturnType<typeof getAdminUsers>>["users"][number];
export type AdminUserDetail = NonNullable<Awaited<ReturnType<typeof getAdminUser>>>;
export type AdminSubscriptionListItem = Awaited<ReturnType<typeof getAdminSubscriptions>>["subscriptions"][number];
export type AdminPaymentListItem = Awaited<ReturnType<typeof getAdminPayments>>["payments"][number];
export type AdminContactMessageListItem = Awaited<ReturnType<typeof getAdminContactMessages>>["messages"][number];
