import Link from "next/link";
import { Activity, ArrowUpRight, BadgeIndianRupee, Download, ImageIcon, MessageSquareText, Users } from "lucide-react";

import { getAdminAnalyticsData } from "@/lib/admin-data";
import { formatInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

function pct(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function InsightCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((item.value / max) * 100, 4)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendBars({ items }: { items: { label: string; value: number; isCurrent: boolean }[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const average = Math.round(total / Math.max(items.length, 1));
  const current = items[items.length - 1]?.value ?? 0;
  const previous = items[items.length - 2]?.value ?? 0;
  const change = current - previous;
  const peak = items.reduce((highest, item) => (item.value > highest.value ? item : highest), items[0] ?? { label: "-", value: 0, isCurrent: false });
  const changeLabel = previous ? `${change >= 0 ? "+" : ""}${Math.round((change / previous) * 100)}% vs previous month` : current ? "New activity this month" : "No change yet";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current</p>
          <p className="mt-2 text-2xl font-semibold">{current}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Average</p>
          <p className="mt-2 text-2xl font-semibold">{average}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Peak</p>
          <p className="mt-2 text-2xl font-semibold">{peak.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{peak.label}</p>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border bg-background p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Monthly downloads</p>
            <p className="mt-1 text-xs text-muted-foreground">Each bar shows completed downloads in that calendar month.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${change >= 0 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
            <ArrowUpRight className={`h-3.5 w-3.5 ${change < 0 ? "rotate-90" : ""}`} />
            {changeLabel}
          </span>
        </div>

        <div className="relative mt-6 h-72 overflow-hidden rounded-3xl bg-muted/25 p-4">
          <div className="absolute inset-x-4 top-6 border-t border-dashed" />
          <div className="absolute inset-x-4 top-1/2 border-t border-dashed" />
          <div className="absolute inset-x-4 bottom-14 border-t border-dashed" />
          <div className="relative flex h-full items-end gap-3 sm:gap-4" aria-label="Six month download trend">
            {items.map((item) => {
              const height = item.value ? Math.max((item.value / max) * 100, 8) : 2;

              return (
                <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`${item.label}: ${item.value} downloads`}>
                  <span className={`text-xs font-semibold ${item.isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{item.value}</span>
                  <div className="flex h-44 w-full items-end rounded-2xl border bg-background/80 p-1.5 shadow-inner">
                    <div
                      className={`w-full rounded-xl transition-all ${item.isCurrent ? "bg-primary shadow-lg shadow-primary/20" : "bg-primary/45"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${item.isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminAnalyticsData();
  const assetPublishRate = pct(data.counts.publishedAssets, data.counts.assets);
  const activeUserRate = pct(data.counts.activeUsers, data.counts.users);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <section className="overflow-hidden rounded-[var(--radius-lg)] border bg-card shadow-sm">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-muted-foreground">Admin dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Operations overview</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                Monitor user growth, asset readiness, payments, downloads, and support requests from one focused workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/assets/new"
                className="rounded-[var(--radius-md)] bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Upload new asset
              </Link>
              <Link
                href="/admin/contact-messages"
                className="rounded-[var(--radius-md)] border bg-background px-5 py-4 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Review messages
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard label="Users" value={data.counts.users} detail={`${data.counts.usersToday} joined today · ${activeUserRate}% active`} icon={Users} tone="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300" />
          <InsightCard label="Assets" value={data.counts.assets} detail={`${data.counts.publishedAssets} published · ${assetPublishRate}% live`} icon={ImageIcon} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
          <InsightCard label="Revenue" value={formatInr(data.revenuePaise / 100)} detail={`${data.counts.paidPayments} paid payments · ${data.counts.activeSubscriptions} active subs`} icon={BadgeIndianRupee} tone="bg-amber-500/10 text-amber-700 dark:text-amber-300" />
          <InsightCard label="Downloads" value={data.counts.downloads} detail={`${data.counts.bookmarks} bookmarks · ${data.counts.unreadContacts} new messages`} icon={Download} tone="bg-violet-500/10 text-violet-600 dark:text-violet-300" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Download trend</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Last 6 months activity</h2>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-6">
              <TrendBars items={data.downloadTrend} />
            </div>
          </div>
          <div className="grid gap-6">
            <div className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight">Plan mix</h2>
              <div className="mt-5">
                <BarList items={data.planBreakdown} />
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight">Asset formats</h2>
              <div className="mt-5">
                <BarList items={data.assetTypeBreakdown} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Signed-in users</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Recently joined members</h2>
              </div>
              <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {data.recentUsers.length ? (
                data.recentUsers.map((user) => (
                  <div key={user.id} className="grid gap-4 px-5 py-4 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-5">
                      <p className="font-semibold">{user.name ?? "Unnamed user"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-sm font-semibold md:col-span-2">{user.plan}</p>
                    <p className="text-sm text-muted-foreground md:col-span-3">{user._count.downloads} downloads · {user._count.bookmarks} bookmarks</p>
                    <p className="text-sm text-muted-foreground md:col-span-2 md:text-right">{formatDate(user.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm text-muted-foreground">No users found.</p>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight">Popular assets</h2>
                <Link href="/admin/assets" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Manage</Link>
              </div>
              <div className="mt-5 space-y-3">
                {data.popularAssets.length ? data.popularAssets.map((asset) => (
                  <div key={asset.id} className="rounded-[var(--radius-md)] border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{asset.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{asset.category.name} · {asset.accessLevel}</p>
                      </div>
                      <span className="rounded-[var(--radius-md)] bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{asset.downloadCount}</span>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No assets yet.</p>}
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight">New support messages</h2>
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-5 space-y-3">
                {data.recentContacts.length ? data.recentContacts.map((message) => (
                  <Link key={message.id} href="/admin/contact-messages" className="block rounded-[var(--radius-md)] border bg-background p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{message.subject}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{message.name} · {message.email}</p>
                      </div>
                      <span className="rounded-[var(--radius-md)] bg-muted px-2 py-1 text-[11px] font-semibold">{message.status}</span>
                    </div>
                  </Link>
                )) : <p className="text-sm text-muted-foreground">No contact messages yet.</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
