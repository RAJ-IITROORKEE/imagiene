import type { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type AdminSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 20;

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

function cleanParam(params: AdminSearchParams, key: string): string | undefined {
  const value = firstParam(params, key)?.trim();
  return value ? value : undefined;
}

export async function getAdminAnalyticsData() {
  await requireAdmin();

  const [
    userCount,
    activeUserCount,
    assetCount,
    publishedAssetCount,
    categoryCount,
    tagCount,
    bookmarkCount,
    downloadCount,
    activeSubscriptionCount,
    paidPaymentCount,
    revenue,
    recentPayments,
    popularAssets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, isPublished: true } }),
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
  ]);

  return {
    counts: {
      users: userCount,
      activeUsers: activeUserCount,
      assets: assetCount,
      publishedAssets: publishedAssetCount,
      categories: categoryCount,
      tags: tagCount,
      bookmarks: bookmarkCount,
      downloads: downloadCount,
      activeSubscriptions: activeSubscriptionCount,
      paidPayments: paidPaymentCount,
    },
    revenuePaise: revenue._sum.amount ?? 0,
    recentPayments,
    popularAssets,
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

  return {
    assets,
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
  const q = cleanParam(params, "q");
  const where: Prisma.UserWhereInput = {
    OR: q
      ? [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  };
  const skip = (page - 1) * DEFAULT_PAGE_SIZE;
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: DEFAULT_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookmarks: true, downloads: true, payments: true } } },
    }),
  ]);

  return { users, total, page, pageCount: Math.ceil(total / DEFAULT_PAGE_SIZE), query: { q } };
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

  return {
    admin,
    env: {
      database: Boolean(process.env.DATABASE_URL),
      clerk: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
      clerkWebhook: Boolean(process.env.CLERK_WEBHOOK_SECRET),
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      razorpayWebhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      cloudinary: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET,
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
