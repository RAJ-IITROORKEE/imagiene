import Link from "next/link";
import type { Metadata } from "next";

import { DashboardAssetRow } from "@/components/dashboard/dashboard-asset-row";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { EmptyDashboardState } from "@/components/dashboard/empty-dashboard-state";
import { PlanCard } from "@/components/dashboard/plan-card";
import { PlanBadge } from "@/components/dashboard/plan-badge";
import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { getDashboardOverviewData } from "@/lib/dashboard-data";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Imagiene profile, plan, bookmarks, and downloads.",
};

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

export default async function DashboardPage() {
  const data = await getDashboardOverviewData();
  const displayName = data.user.name ?? data.user.email;

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <div className="bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_82%),transparent_36rem)] p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
                <PlanBadge plan={data.user.plan} />
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">Welcome back, {displayName}</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground">
                Track your library access, continue from saved assets, and review recent research downloads from one clean workspace.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-background/75 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
                  <p className="mt-2 text-lg font-semibold">{data.plan.name}</p>
                </div>
                <div className="rounded-2xl border bg-background/75 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Bookmarks</p>
                  <p className="mt-2 text-lg font-semibold">{data.stats.bookmarks}</p>
                </div>
                <div className="rounded-2xl border bg-background/75 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Downloads</p>
                  <p className="mt-2 text-lg font-semibold">{data.stats.downloads}</p>
                </div>
              </div>
            </div>
            <aside className="border-t bg-muted/20 p-8 lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ProfileAvatar name={data.user.name ?? ""} email={data.user.email} imageUrl={data.user.imageUrl} className="h-28 w-28 text-3xl" />
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">{displayName}</h2>
                <p className="mt-2 max-w-64 break-all text-sm text-muted-foreground">{data.user.email}</p>
                <div className="mt-5 grid w-full gap-3 text-left">
                  <div className="rounded-2xl border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Member since</p>
                    <p className="mt-2 text-sm font-semibold">{formatDate(data.user.createdAt)}</p>
                  </div>
                  <Link href="/dashboard/settings" className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                    Edit profile
                  </Link>
                </div>
              </div>
            </aside>
          </div>
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
              <Link href="/#pricing" className="mt-5 inline-flex rounded-[var(--radius-md)] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Compare plans
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
