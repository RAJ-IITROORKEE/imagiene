import Link from "next/link";
import { ArrowDown, ArrowUp, Crown, Eye, Search, ShieldCheck, UserCheck, Users } from "lucide-react";
import type { ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <Link href={buildSortHref(params, field)} className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition hover:bg-background hover:text-foreground">
      {children}
      {active ? (dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />) : null}
    </Link>
  );
}

function UserStatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  gradient,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Users;
  tone: string;
  gradient: string;
}) {
  return (
    <article className={`rounded-3xl border-0 p-5 shadow-sm ring-1 ring-border/50 ${gradient}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function roleBadge(role: string) {
  return role === "ADMIN"
    ? "bg-violet-500/15 text-violet-700 dark:text-violet-200"
    : "bg-sky-500/15 text-sky-700 dark:text-sky-200";
}

function planBadge(plan: string) {
  if (plan === "PREMIUM") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-200";
  }

  if (plan === "PRO") {
    return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-cyan-100";
  }

  return "bg-muted text-muted-foreground";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const data = await getAdminUsers(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Users" title="Manage members and access" description="Review Clerk-synced users, app roles, plans, active state, downloads, bookmarks, and payments." />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <UserStatCard label="Total users" value={data.stats.totalUsers} description="All Clerk-synced members" icon={Users} tone="bg-blue-500/15 text-blue-700 dark:text-blue-200" gradient="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/25 dark:to-blue-900/10" />
          <UserStatCard label="Active users" value={data.stats.activeUsers} description="Currently enabled accounts" icon={UserCheck} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" gradient="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/25 dark:to-emerald-900/10" />
          <UserStatCard label="Admins" value={data.stats.adminUsers} description="Can access this workspace" icon={ShieldCheck} tone="bg-violet-500/15 text-violet-700 dark:text-violet-200" gradient="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/25 dark:to-violet-900/10" />
          <UserStatCard label="Paid plans" value={data.stats.paidUsers} description="Pro and Premium users" icon={Crown} tone="bg-amber-500/15 text-amber-700 dark:text-amber-200" gradient="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/25 dark:to-amber-900/10" />
        </section>

        <section className="overflow-hidden rounded-3xl border bg-card shadow-lg shadow-black/5">
          <div className="flex flex-col gap-4 border-b px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">User Management</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage {data.total.toLocaleString("en-IN")} users, roles, plans, and account activity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full border bg-background px-3 py-1.5">Page {data.page} / {data.pageCount}</span>
              <span className="rounded-full border bg-background px-3 py-1.5">Showing {data.users.length}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b bg-muted/20 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <form className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
              <input type="hidden" name="sort" value={data.query.sort} />
              <input type="hidden" name="dir" value={data.query.dir} />
              <input type="hidden" name="pageSize" value={data.pageSize} />
              <label className="relative block flex-1">
                <span className="sr-only">Search users</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  defaultValue={data.query.q}
                  placeholder="Search name or email..."
                  className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <button className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Filter
              </button>
            </form>

            <form className="flex items-center gap-2">
              {data.query.q ? <input type="hidden" name="q" value={data.query.q} /> : null}
              <input type="hidden" name="sort" value={data.query.sort} />
              <input type="hidden" name="dir" value={data.query.dir} />
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="pageSize">Rows</label>
              <select id="pageSize" name="pageSize" defaultValue={data.pageSize} className="h-10 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button className="h-10 rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted">Apply</button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-muted/45 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3"><SortLink params={params} field="name">User</SortLink></th>
                  <th className="px-5 py-3"><SortLink params={params} field="email">Email</SortLink></th>
                  <th className="px-5 py-3"><SortLink params={params} field="role">Role</SortLink></th>
                  <th className="px-5 py-3"><SortLink params={params} field="plan">Plan</SortLink></th>
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3"><SortLink params={params} field="createdAt">Joined</SortLink></th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.users.length ? data.users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-muted/35">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <AdminUserAvatar name={user.name} email={user.email} imageUrl={user.imageUrl} className="size-10" />
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate font-semibold">{user.name ?? "Unnamed user"}</p>
                          <p className="text-xs text-muted-foreground">{user.isActive ? "Active account" : "Inactive account"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(user.role)}`}>{user.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${planBadge(user.plan)}`}>{user.plan}</span>
                        <span className={`text-xs ${user.isActive ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground"}`}>{user.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      <div className="grid gap-1">
                        <span>{user._count.downloads.toLocaleString("en-IN")} downloads</span>
                        <span>{user._count.payments.toLocaleString("en-IN")} payments · {user._count.bookmarks.toLocaleString("en-IN")} saved</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <Link href={`/admin/users/${user.id}`} className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold transition hover:bg-muted">
                          <Eye className="mr-1.5 size-3.5" />
                          View
                        </Link>
                        <AdminUserDeleteButton userId={user.id} label={user.name ?? user.email} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t px-5 py-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <p>Showing {data.users.length} of {data.total.toLocaleString("en-IN")} users</p>
            <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/users" searchParams={params} />
          </div>
        </section>
      </div>
    </main>
  );
}
