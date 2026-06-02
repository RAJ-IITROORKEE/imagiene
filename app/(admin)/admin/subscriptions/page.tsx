import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { Pagination } from "@/components/library/pagination";
import type { AdminSearchParams } from "@/lib/admin-data";
import { getAdminSubscriptions } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminSubscriptionsPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

function formatDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value) : "Not set";
}

export default async function AdminSubscriptionsPage({ searchParams }: AdminSubscriptionsPageProps) {
  const params = await searchParams;
  const data = await getAdminSubscriptions(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Subscriptions" title="Subscription records" description="Review active and historic plan grants created by verified Razorpay payments." />
        <AdminSearchForm placeholder="Search by user email or name" defaultValue={data.query.q} />
        <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="divide-y">
            {data.subscriptions.length ? data.subscriptions.map((subscription) => (
              <div key={subscription.id} className="grid gap-4 px-5 py-4 md:grid-cols-5 md:items-center">
                <div className="md:col-span-2">
                  <p className="font-medium">{subscription.user.email}</p>
                  <p className="text-sm text-muted-foreground">{subscription.user.name ?? "Unnamed user"}</p>
                </div>
                <p className="text-sm font-semibold">{subscription.plan}</p>
                <p className="text-sm">{subscription.status}</p>
                <p className="text-sm text-muted-foreground">Expires {formatDate(subscription.expiresAt)}</p>
              </div>
            )) : <p className="p-6 text-sm text-muted-foreground">No subscriptions found.</p>}
          </div>
        </section>
        <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/subscriptions" searchParams={params} />
      </div>
    </main>
  );
}
