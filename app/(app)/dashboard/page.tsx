import Link from "next/link";
import type { Metadata } from "next";

import { DashboardAssetRow } from "@/components/dashboard/dashboard-asset-row";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { EmptyDashboardState } from "@/components/dashboard/empty-dashboard-state";
import { PlanCard } from "@/components/dashboard/plan-card";
import { getDashboardOverviewData } from "@/lib/dashboard-data";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Imagiene profile, plan, bookmarks, and downloads.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardOverviewData();
  const displayName = data.user.name ?? data.user.email;

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border bg-muted/20 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Welcome back, {displayName}</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Track your library access, continue from saved assets, and review recent research downloads.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard label="Bookmarks" value={data.stats.bookmarks} detail="Saved visuals for later use" />
          <DashboardStatCard label="Downloads" value={data.stats.downloads} detail="Files accessed from the library" />
          <DashboardStatCard label="Current plan" value={data.plan.name} detail={data.plan.displayPrice} />
        </div>

        <PlanCard plan={data.plan} subscription={data.subscription} />

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Recent bookmarks</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Saved assets</h2>
              </div>
              <Link href="/dashboard/bookmarks" className="text-sm font-semibold underline-offset-4 hover:underline">
                View all
              </Link>
            </div>
            {data.recentBookmarks.length ? (
              <div className="space-y-4">
                {data.recentBookmarks.map((bookmark) => (
                  <DashboardAssetRow key={bookmark.id} asset={bookmark.asset} timestamp={bookmark.createdAt} timestampLabel="Saved" />
                ))}
              </div>
            ) : (
              <EmptyDashboardState title="No bookmarks yet" description="Save useful diagrams and illustrations from the library to build a personal shortlist." />
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border bg-background p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Recent payments</p>
              <div className="mt-5 space-y-3">
                {data.recentPayments.length ? (
                  data.recentPayments.map((payment) => (
                    <div key={payment.id} className="rounded-2xl border p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{payment.plan}</span>
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{payment.status}</span>
                      </div>
                      <p className="mt-2 text-muted-foreground">{formatInr(payment.amount / 100)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">Paid plan activity will appear here after checkout.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border bg-muted/20 p-6">
              <h2 className="text-xl font-semibold">Need a wider collection?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Compare Pro and Premium access levels before downloading locked assets.
              </p>
              <Link href="/pricing" className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background">
                Compare plans
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
