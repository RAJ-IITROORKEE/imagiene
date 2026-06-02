import { requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
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
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
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

    return ok({
      data: {
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
        revenue: {
          currency: "INR",
          amountPaise: revenue._sum.amount ?? 0,
        },
        recentPayments,
        popularAssets,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
