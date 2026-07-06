"use client";

import { ChevronLeft, ChevronRight, ChevronsUpDown, Edit3, FolderTree, Plus, Search, Tags, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminCategoryRecord, AdminTagRecord } from "@/lib/admin-data";

type AdminCategoryDatabaseProps = {
  categories: AdminCategoryRecord[];
  tags: AdminTagRecord[];
};

type SortKey = "name" | "slug" | "assets" | "createdAt";
type SortDirection = "asc" | "desc";
type EditableCategory = { id?: string; name: string; slug: string; description: string };

const PAGE_SIZE = 8;

function sortValue(record: AdminCategoryRecord, key: SortKey) {
  if (key === "assets") return record._count.assets;
  if (key === "createdAt") return new Date(record.createdAt).getTime();
  return record[key].toLowerCase();
}

function filteredRecords(records: AdminCategoryRecord[], query: string, sortKey: SortKey, sortDirection: SortDirection) {
  const cleanQuery = query.trim().toLowerCase();
  const filtered = cleanQuery
    ? records.filter((record) => [record.name, record.slug, record.description ?? ""].join(" ").toLowerCase().includes(cleanQuery))
    : records;

  return [...filtered].sort((a, b) => {
    const left = sortValue(a, sortKey);
    const right = sortValue(b, sortKey);
    const direction = sortDirection === "asc" ? 1 : -1;

    if (left > right) return direction;
    if (left < right) return -direction;
    return 0;
  });
}

function pageRecords(records: AdminCategoryRecord[], page: number) {
  return records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: typeof FolderTree; tone: string }) {
  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

export function AdminCategoryDatabase({ categories, tags }: AdminCategoryDatabaseProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "name", direction: "asc" });
  const [editing, setEditing] = useState<EditableCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = filteredRecords(categories, query, sort.key, sort.direction);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = pageRecords(rows, currentPage);
  const linkedAssets = categories.reduce((sum, category) => sum + category._count.assets, 0);

  function openCreateDialog() {
    setEditing({ name: "", slug: "", description: "" });
    setError(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: AdminCategoryRecord) {
    setEditing({ id: category.id, name: category.name, slug: category.slug, description: category.description ?? "" });
    setError(null);
    setDialogOpen(true);
  }

  function toggleSort(key: SortKey) {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  }

  function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setError(null);
    const endpoint = editing.id ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const method = editing.id ? "PATCH" : "POST";

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, slug: editing.slug, description: editing.description }),
      });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, "Category could not be saved.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(editing.id ? "Category updated" : "Category created");
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    });
  }

  function deleteCategory(category: AdminCategoryRecord) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, "Category could not be deleted.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Category deleted");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6">
      {error ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Categories" value={categories.length} icon={FolderTree} tone="bg-primary/10 text-primary" />
        <StatCard label="Linked assets" value={linkedAssets} icon={FolderTree} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
        <StatCard label="Dynamic tags" value={tags.length} icon={Tags} tone="bg-violet-500/15 text-violet-700 dark:text-violet-300" />
        <StatCard label="Tag workflow" value="Per asset" icon={Tags} tone="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
      </section>

      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Taxonomy</p>
            <h2 className="mt-1 text-xl font-semibold">Categories database</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tags are entered directly while creating or editing an asset and are reused automatically.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block sm:w-80">
              <span className="sr-only">Search categories</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search categories..." className="h-11 w-full rounded-2xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary" />
            </label>
            <Button type="button" onClick={openCreateDialog} className="h-11 rounded-2xl px-4">
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <div className="hidden grid-cols-[1.2fr_1fr_0.65fr_0.8fr_120px] gap-4 border-b bg-muted/45 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
            <SortableHead label="Name" active={sort.key === "name"} onClick={() => toggleSort("name")} />
            <SortableHead label="Slug" active={sort.key === "slug"} onClick={() => toggleSort("slug")} />
            <SortableHead label="Assets" active={sort.key === "assets"} onClick={() => toggleSort("assets")} />
            <SortableHead label="Created" active={sort.key === "createdAt"} onClick={() => toggleSort("createdAt")} />
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y">
            {visibleRows.length ? visibleRows.map((category) => (
              <article key={category.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr_0.65fr_0.8fr_120px] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description || "No description yet"}</p>
                </div>
                <p className="break-all font-mono text-xs text-muted-foreground">/{category.slug}</p>
                <p className="text-sm"><span className="md:hidden text-muted-foreground">Assets: </span>{category._count.assets}</p>
                <p className="text-sm text-muted-foreground"><span className="md:hidden">Created: </span>{formatDate(category.createdAt)}</p>
                <div className="flex items-center gap-2 md:justify-end">
                  <Button type="button" size="icon-sm" variant="outline" onClick={() => openEditDialog(category)} aria-label={`Edit ${category.name}`}><Edit3 className="h-4 w-4" /></Button>
                  <Button type="button" size="icon-sm" variant="destructive" onClick={() => deleteCategory(category)} disabled={isPending || category._count.assets > 0} aria-label={`Delete ${category.name}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </article>
            )) : <p className="p-6 text-sm text-muted-foreground">No categories found.</p>}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Showing {visibleRows.length} of {rows.length} categories</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4" />Prev</Button>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{currentPage} / {pageCount}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={currentPage >= pageCount}>Next<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogDescription>{editing?.id ? "Edit category" : "Add category"}</DialogDescription>
            <DialogTitle>{editing?.id ? "Update category details" : "Create a new category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveCategory} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">Name<input value={editing?.name ?? ""} onChange={(event) => setEditing((current) => current ? { ...current, name: event.target.value } : current)} required minLength={2} className="h-11 rounded-2xl border bg-background px-4 font-normal outline-none focus:border-primary" placeholder="Scientific diagrams" /></label>
            <label className="grid gap-2 text-sm font-semibold">Slug <span className="text-xs font-normal text-muted-foreground">Optional. Leave empty to generate automatically.</span><input value={editing?.slug ?? ""} onChange={(event) => setEditing((current) => current ? { ...current, slug: event.target.value } : current)} className="h-11 rounded-2xl border bg-background px-4 font-normal outline-none focus:border-primary" placeholder="auto-generated-from-name" /></label>
            <label className="grid gap-2 text-sm font-semibold">Description <span className="text-xs font-normal text-muted-foreground">Optional</span><textarea value={editing?.description ?? ""} onChange={(event) => setEditing((current) => current ? { ...current, description: event.target.value } : current)} rows={4} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-primary" placeholder="What kind of assets belong here?" /></label>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>Cancel</Button><Button disabled={isPending}>{editing?.id ? "Save changes" : "Create category"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableHead({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 text-left transition hover:text-foreground ${active ? "text-foreground" : ""}`}>{label}<ChevronsUpDown className="h-3.5 w-3.5" /></button>;
}
