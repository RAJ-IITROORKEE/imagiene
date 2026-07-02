import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPlanSettingsForm } from "@/components/admin/admin-plan-settings-form";
import { getAdminSettingsData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

const envRows = [
  ["Database", "DATABASE_URL", "database"],
  ["Clerk auth", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY", "clerk"],
  ["Clerk webhook", "CLERK_WEBHOOK_SECRET", "clerkWebhook"],
  ["Razorpay", "NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET", "razorpay"],
  ["Razorpay webhook", "RAZORPAY_WEBHOOK_SECRET", "razorpayWebhook"],
  ["Cloudflare R2", "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET_NAME", "r2"],
  ["Upstash Redis", "UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN", "redis"],
] as const;

export default async function AdminSettingsPage() {
  const data = await getAdminSettingsData();

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-5xl gap-8">
        <AdminPageHeader eyebrow="Settings" title="Operational configuration" description="Review environment readiness for database, authentication, payments, uploads, webhooks, and rate limiting." />
        <AdminPlanSettingsForm plans={data.plans} />
        <section className="rounded-3xl border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Environment checklist</h2>
          <div className="mt-5 divide-y rounded-2xl border">
            {envRows.map(([label, keys, key]) => (
              <div key={key} className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <p className="font-medium">{label}</p>
                <code className="text-xs text-muted-foreground">{keys}</code>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.env[key] ? "bg-green-500/10 text-green-700 dark:text-green-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                  {data.env[key] ? "Configured" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border bg-muted/30 p-6">
          <h2 className="text-xl font-semibold">Current administrator</h2>
          <p className="mt-2 text-muted-foreground">{data.admin.name ?? data.admin.email}</p>
          <p className="mt-1 text-sm text-muted-foreground">Role: {data.admin.role} · Plan: {data.admin.plan}</p>
        </section>
      </div>
    </main>
  );
}
