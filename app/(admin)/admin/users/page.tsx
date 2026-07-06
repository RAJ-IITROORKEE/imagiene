import Link from "next/link";
import { ArrowDown, ArrowUp, Crown, Eye, ShieldCheck, UserCheck, Users } from "lucide-react";
import type { ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { AdminUserAvatar } from "@/components/admin/admin-user-avatar";
import { AdminUserDeleteButton } from "@/components/admin/admin-user-delete-button";
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

function firstParam(params: AdminSearchParams, key: string) {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function buildSortHref(params: AdminSearchParams, sort: string) {
  const next = new URLSearchParams();
  const currentSort = firstParam(params, "sort") ?? "createdAt";
  const currentDir = firstParam(params, "dir") ?? "desc";

  for (const [key, value] of Object.entries(params)) {
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue && key !== "sort" && key !== "dir" && key !== "page") {
      next.set(key, firstValue);
    }
  }

  next.set("sort", sort);
  next.set("dir", currentSort === sort && currentDir === "asc" ? "desc" : "asc");

  return `/admin/users?${next.toString()}`;
}

function SortLink({ params, field, children }: { params: AdminSearchParams; field: string; children: ReactNode }) {
  const active = (firstParam(params, "sort") ?? "createdAt") === field;
  const dir = firstParam(params, "dir") ?? "desc";

  return (
    <Link href={buildSortHref(params, field)} className="inline-flex items-center gap-1.5 transition hover:text-foreground">
      {children}
      {active ? (dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />) : null}
    </Link>
  );
}

function UserStatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Users; tone: string }) {
  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const data = await getAdminUsers(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Users" title="Manage members and access" description="Review Clerk-synced users, app roles, plans, active state, downloads, bookmarks, and payments." />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UserStatCard label="Total users" value={data.stats.totalUsers} icon={Users} tone="bg-primary/10 text-primary" />
          <UserStatCard label="Active users" value={data.stats.activeUsers} icon={UserCheck} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
          <UserStatCard label="Admins" value={data.stats.adminUsers} icon={ShieldCheck} tone="bg-violet-500/15 text-violet-700 dark:text-violet-300" />
          <UserStatCard label="Paid plans" value={data.stats.paidUsers} icon={Crown} tone="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
        </section>

        <div className="grid gap-3 rounded-3xl border bg-background p-4 shadow-sm lg:grid-cols-[1fr_auto]">
          <AdminSearchForm placeholder="Search users by email or name" defaultValue={data.query.q} />
          <form className="grid gap-3 sm:grid-cols-[auto_auto]">
            {data.query.q ? <input type="hidden" name="q" value={data.query.q} /> : null}
            <input type="hidden" name="sort" value={data.query.sort} />
            <input type="hidden" name="dir" value={data.query.dir} />
            <label className="sr-only" htmlFor="pageSize">Rows per page</label>
            <select id="pageSize" name="pageSize" defaultValue={data.pageSize} className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground">
              <option value="10">10 rows</option>
              <option value="20">20 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </select>
            <button className="rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:bg-muted">Apply</button>
          </form>
        </div>
        <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="hidden grid-cols-12 gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
            <span className="col-span-4"><SortLink params={params} field="name">User</SortLink></span>
            <span className="col-span-2"><SortLink params={params} field="role">Role</SortLink></span>
            <span className="col-span-2"><SortLink params={params} field="plan">Plan</SortLink></span>
            <span className="col-span-2">Activity</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <div className="divide-y">
            {data.users.length ? data.users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-12 md:items-center">
                <div className="flex min-w-0 items-center gap-3 md:col-span-4">
                  <AdminUserAvatar name={user.name} email={user.email} imageUrl={user.imageUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name ?? "Unnamed user"}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email} · Joined {formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold md:col-span-2"><span className="md:hidden text-muted-foreground">Role: </span>{user.role}</p>
                <p className="text-sm md:col-span-2"><span className="md:hidden text-muted-foreground">Plan: </span>{user.plan} · {user.isActive ? "Active" : "Inactive"}</p>
                <p className="text-sm text-muted-foreground md:col-span-2"><span className="md:hidden text-muted-foreground">Activity: </span>{user._count.downloads} downloads · {user._count.payments} payments</p>
                <div className="flex flex-wrap items-center gap-2 md:col-span-2 md:justify-end">
                  <Link href={`/admin/users/${user.id}`} className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold transition hover:bg-muted">
                    <Eye className="mr-1.5 size-3.5" />
                    View
                  </Link>
                  <AdminUserDeleteButton userId={user.id} label={user.name ?? user.email} />
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
