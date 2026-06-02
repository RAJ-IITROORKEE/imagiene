import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { getAdminUser } from "@/lib/admin-data";
import { formatInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminUserDetailPageProps = {
  params: Promise<{ userId: string }>;
};

function formatDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value) : "Not set";
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { userId } = await params;
  const user = await getAdminUser(userId);

  if (!user) {
    notFound();
  }

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="User detail" title={user.name ?? user.email} description="Inspect subscriptions and payments, then adjust app-level role, plan, or active state." />
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Plan" value={user.plan} detail={user.isActive ? "Active account" : "Inactive account"} />
          <AdminStatCard label="Role" value={user.role} detail={user.email} />
          <AdminStatCard label="Bookmarks" value={user._count.bookmarks} />
          <AdminStatCard label="Downloads" value={user._count.downloads} />
        </section>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <AdminUserForm user={user} />
          <section className="grid gap-6">
            <div className="rounded-3xl border bg-background p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Subscription history</h2>
              <div className="mt-5 divide-y rounded-2xl border">
                {user.subscriptions.length ? user.subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium">{subscription.plan} · {subscription.status}</p>
                      <p className="text-xs text-muted-foreground">Expires {formatDate(subscription.expiresAt)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(subscription.createdAt)}</p>
                  </div>
                )) : <p className="p-4 text-sm text-muted-foreground">No subscriptions.</p>}
              </div>
            </div>
            <div className="rounded-3xl border bg-background p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Payment history</h2>
              <div className="mt-5 divide-y rounded-2xl border">
                {user.payments.length ? user.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium">{payment.plan} · {payment.status}</p>
                      <p className="text-xs text-muted-foreground">{payment.razorpayOrderId}</p>
                    </div>
                    <p className="font-semibold">{formatInr(payment.amount / 100)}</p>
                  </div>
                )) : <p className="p-4 text-sm text-muted-foreground">No payments.</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
