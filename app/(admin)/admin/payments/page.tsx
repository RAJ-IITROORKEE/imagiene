import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { Pagination } from "@/components/library/pagination";
import type { AdminSearchParams } from "@/lib/admin-data";
import { getAdminPayments } from "@/lib/admin-data";
import { formatInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminPaymentsPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  const params = await searchParams;
  const data = await getAdminPayments(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Payments" title="Razorpay payment ledger" description="Audit created, paid, failed, and refunded Razorpay-backed payment records." />
        <AdminSearchForm placeholder="Search by user email or name" defaultValue={data.query.q} />
        <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="divide-y">
            {data.payments.length ? data.payments.map((payment) => (
              <div key={payment.id} className="grid gap-4 px-5 py-4 md:grid-cols-6 md:items-center">
                <div className="md:col-span-2">
                  <p className="font-medium">{payment.user.email}</p>
                  <p className="text-xs text-muted-foreground">{payment.razorpayOrderId}</p>
                </div>
                <p className="text-sm font-semibold">{payment.plan}</p>
                <p className="text-sm">{payment.status}</p>
                <p className="font-semibold">{formatInr(payment.amount / 100)}</p>
                <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
              </div>
            )) : <p className="p-6 text-sm text-muted-foreground">No payments found.</p>}
          </div>
        </section>
        <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/payments" searchParams={params} />
      </div>
    </main>
  );
}
