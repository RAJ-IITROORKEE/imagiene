import Link from "next/link";
import { Mail, MessageSquareText } from "lucide-react";

import { ContactMessageActions } from "@/components/admin/contact-message-actions";
import { ContactMessageStatusSelect } from "@/components/admin/contact-message-status-select";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { Pagination } from "@/components/library/pagination";
import type { AdminSearchParams } from "@/lib/admin-data";
import { getAdminContactMessages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminContactMessagesPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function statusClass(status: string) {
  if (status === "NEW") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (status === "RESOLVED") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "border-primary/20 bg-primary/10 text-primary";
}

export default async function AdminContactMessagesPage({ searchParams }: AdminContactMessagesPageProps) {
  const params = await searchParams;
  const data = await getAdminContactMessages(params);

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Support inbox</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Contact messages</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review user requests from the public contact page, update status, and reply directly by email.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Unread</p>
                <p className="mt-1 text-2xl font-semibold">{data.unreadCount}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current view</p>
                <p className="mt-1 text-2xl font-semibold">{data.total}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <AdminSearchForm placeholder="Search messages by name, email, subject, or text" defaultValue={data.query.q} />
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", href: "/admin/contact-messages" },
              { label: "New", href: "/admin/contact-messages?status=NEW" },
              { label: "Read", href: "/admin/contact-messages?status=READ" },
              { label: "Resolved", href: "/admin/contact-messages?status=RESOLVED" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[var(--radius-md)] border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <section className="overflow-hidden rounded-[var(--radius-lg)] border bg-card shadow-sm">
          <div className="hidden grid-cols-12 gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
            <span className="col-span-4">Sender</span>
            <span className="col-span-3">Message</span>
            <span className="col-span-2">Received</span>
            <span className="col-span-1 text-right">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <div className="divide-y">
            {data.messages.length ? (
              data.messages.map((message) => (
                <article key={message.id} className="grid gap-4 px-5 py-5 md:grid-cols-12 md:items-start">
                  <div className="md:col-span-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                        <MessageSquareText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{message.name}</p>
                        <a className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" href={`mailto:${message.email}`}>
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{message.email}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{message.subject}</p>
                      <span className={`rounded-[var(--radius-md)] border px-2 py-1 text-[11px] font-semibold ${statusClass(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{message.message}</p>
                  </div>
                  <p className="text-sm text-muted-foreground md:col-span-2">{formatDate(message.createdAt)}</p>
                  <div className="md:col-span-1 md:justify-self-end">
                    <ContactMessageStatusSelect messageId={message.id} status={message.status} />
                  </div>
                  <div className="md:col-span-2 md:justify-self-end">
                    <ContactMessageActions message={message} />
                  </div>
                </article>
              ))
            ) : (
              <p className="p-6 text-sm text-muted-foreground">No contact messages found.</p>
            )}
          </div>
        </section>
        <Pagination page={data.page} pageCount={data.pageCount} basePath="/admin/contact-messages" searchParams={params} />
      </div>
    </main>
  );
}
