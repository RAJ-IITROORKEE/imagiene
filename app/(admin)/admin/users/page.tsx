import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { Pagination } from "@/components/library/pagination";
import type { AdminSearchParams } from "@/lib/admin-data";
import { getAdminUsers } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const data = await getAdminUsers(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Users" title="Manage members and access" description="Review Clerk-synced users, app roles, plans, active state, downloads, bookmarks, and payments." />
        <AdminSearchForm placeholder="Search users by email or name" defaultValue={data.query.q} />
        <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="col-span-5">User</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-2">Plan</span>
            <span className="col-span-2">Activity</span>
            <span className="col-span-1 text-right">Edit</span>
          </div>
          <div className="divide-y">
            {data.users.length ? data.users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <p className="font-medium">{user.name ?? "Unnamed user"}</p>
                  <p className="text-sm text-muted-foreground">{user.email} · Joined {formatDate(user.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold md:col-span-2">{user.role}</p>
                <p className="text-sm md:col-span-2">{user.plan} · {user.isActive ? "Active" : "Inactive"}</p>
                <p className="text-sm text-muted-foreground md:col-span-2">{user._count.downloads} downloads · {user._count.payments} payments</p>
                <div className="md:col-span-1 md:text-right">
                  <Link href={`/admin/users/${user.id}`} className="text-sm font-semibold underline-offset-4 hover:underline">Edit</Link>
                </div>
              </div>
            )) : <p className="p-6 text-sm text-muted-foreground">No users found.</p>}
          </div>
        </section>
        <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/users" searchParams={params} />
      </div>
    </main>
  );
}
