import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { getAdminAnalyticsData } from "@/lib/admin-data";
import { formatInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

export default async function AdminPage() {
  const data = await getAdminAnalyticsData();

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader
          eyebrow="Admin overview"
          title="Library operations dashboard"
          description="Monitor assets, users, subscriptions, payments, and download activity from one protected admin workspace."
          action={{ href: "/admin/assets/new", label: "New asset" }}
        />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Users" value={data.counts.users} detail={`${data.counts.activeUsers} active`} />
          <AdminStatCard label="Assets" value={data.counts.assets} detail={`${data.counts.publishedAssets} published`} />
          <AdminStatCard label="Revenue" value={formatInr(data.revenuePaise / 100)} detail={`${data.counts.paidPayments} paid payments`} />
          <AdminStatCard label="Downloads" value={data.counts.downloads} detail={`${data.counts.bookmarks} bookmarks`} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Recent paid payments</h2>
              <Link href="/admin/payments" className="text-sm font-semibold text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            <div className="mt-5 divide-y rounded-2xl border">
              {data.recentPayments.length ? data.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{payment.user.email}</p>
                    <p className="text-xs text-muted-foreground">{payment.plan} · {formatDate(payment.createdAt)}</p>
                  </div>
                  <p className="font-semibold">{formatInr(payment.amount / 100)}</p>
                </div>
              )) : <p className="p-4 text-sm text-muted-foreground">No paid payments yet.</p>}
            </div>
          </div>
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Popular assets</h2>
              <Link href="/admin/assets" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Manage assets</Link>
            </div>
            <div className="mt-5 divide-y rounded-2xl border">
              {data.popularAssets.length ? data.popularAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{asset.title}</p>
                    <p className="text-xs text-muted-foreground">{asset.category.name} · {asset.accessLevel}</p>
                  </div>
                  <p className="text-sm font-semibold">{asset.downloadCount} downloads</p>
                </div>
              )) : <p className="p-4 text-sm text-muted-foreground">No assets yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
