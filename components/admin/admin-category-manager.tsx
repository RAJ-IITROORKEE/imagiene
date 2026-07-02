"use client";

import { ChevronLeft, ChevronRight, ChevronsUpDown, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import type { AdminCategoryRecord, AdminTagRecord } from "@/lib/admin-data";

type AdminCategoryManagerProps = {
  categories: AdminCategoryRecord[];
  tags: AdminTagRecord[];
};

type TaxonomyKind = "Category" | "Tag";
type SortKey = "name" | "slug" | "assets" | "createdAt";
type SortDirection = "asc" | "desc";
type EditableEntity = {
  id: string;
  kind: TaxonomyKind;
  name: string;
  slug: string;
  description: string;
};
type TaxonomyRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  _count: { assets: number };
};

const PAGE_SIZE = 6;

function sortValue(record: TaxonomyRecord, key: SortKey) {
  if (key === "assets") {
    return record._count.assets;
  }

  if (key === "createdAt") {
    return new Date(record.createdAt).getTime();
  }

  return record[key].toLowerCase();
}

function filteredRecords(records: TaxonomyRecord[], query: string, sortKey: SortKey, sortDirection: SortDirection) {
  const cleanQuery = query.trim().toLowerCase();
  const filtered = cleanQuery
    ? records.filter((record) => [record.name, record.slug, record.description ?? ""].join(" ").toLowerCase().includes(cleanQuery))
    : records;

  return [...filtered].sort((a, b) => {
    const left = sortValue(a, sortKey);
    const right = sortValue(b, sortKey);
    const direction = sortDirection === "asc" ? 1 : -1;

    if (left > right) {
      return direction;
    }

    if (left < right) {
      return -direction;
    }

    return 0;
  });
}

function pageRecords(records: TaxonomyRecord[], page: number) {
  return records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function AdminCategoryManager({ categories, tags }: AdminCategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const [categorySort, setCategorySort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "name", direction: "asc" });
  const [tagSort, setTagSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "name", direction: "asc" });
  const [editing, setEditing] = useState<EditableEntity | null>(null);

  function createEntity(event: FormEvent<HTMLFormElement>, endpoint: string, label: TaxonomyKind) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: label === "Category" ? String(formData.get("description") ?? "") : undefined,
    };

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, `${label} could not be created.`);
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(`${label} created`);
      form.reset();
      router.refresh();
    });
  }

  function updateEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editing) {
      return;
    }

    setError(null);
    const endpoint = editing.kind === "Category" ? `/api/admin/categories/${editing.id}` : `/api/admin/tags/${editing.id}`;
    const payload = editing.kind === "Category"
      ? { name: editing.name, slug: editing.slug, description: editing.description }
      : { name: editing.name, slug: editing.slug };

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, `${editing.kind} could not be updated.`);
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(`${editing.kind} updated`);
      setEditing(null);
      router.refresh();
    });
  }

  function deleteEntity(endpoint: string, label: TaxonomyKind) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, `${label} could not be deleted.`);
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(`${label} deleted`);
      router.refresh();
    });
  }

  function toggleSort(kind: TaxonomyKind, key: SortKey) {
    const setSort = kind === "Category" ? setCategorySort : setTagSort;

    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  const categoryRows = filteredRecords(categories, categoryQuery, categorySort.key, categorySort.direction);
  const tagRows = filteredRecords(tags, tagQuery, tagSort.key, tagSort.direction);
  const categoryPageCount = Math.max(1, Math.ceil(categoryRows.length / PAGE_SIZE));
  const tagPageCount = Math.max(1, Math.ceil(tagRows.length / PAGE_SIZE));

  return (
    <div className="grid gap-6">
      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <TaxonomyPanel
          kind="Category"
          records={pageRecords(categoryRows, Math.min(categoryPage, categoryPageCount))}
          total={categoryRows.length}
          page={Math.min(categoryPage, categoryPageCount)}
          pageCount={categoryPageCount}
          query={categoryQuery}
          sort={categorySort}
          isPending={isPending}
          onQueryChange={(value) => { setCategoryQuery(value); setCategoryPage(1); }}
          onPageChange={setCategoryPage}
          onSort={(key) => toggleSort("Category", key)}
          onCreate={(event) => createEntity(event, "/api/admin/categories", "Category")}
          onEdit={(record) => setEditing({ id: record.id, kind: "Category", name: record.name, slug: record.slug, description: record.description ?? "" })}
          onDelete={(record) => deleteEntity(`/api/admin/categories/${record.id}`, "Category")}
        />

        <TaxonomyPanel
          kind="Tag"
          records={pageRecords(tagRows, Math.min(tagPage, tagPageCount))}
          total={tagRows.length}
          page={Math.min(tagPage, tagPageCount)}
          pageCount={tagPageCount}
          query={tagQuery}
          sort={tagSort}
          isPending={isPending}
          onQueryChange={(value) => { setTagQuery(value); setTagPage(1); }}
          onPageChange={setTagPage}
          onSort={(key) => toggleSort("Tag", key)}
          onCreate={(event) => createEntity(event, "/api/admin/tags", "Tag")}
          onEdit={(record) => setEditing({ id: record.id, kind: "Tag", name: record.name, slug: record.slug, description: "" })}
          onDelete={(record) => deleteEntity(`/api/admin/tags/${record.id}`, "Tag")}
        />
      </div>

      {editing ? (
        <form onSubmit={updateEntity} className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Editing {editing.kind}</p>
              <h2 className="mt-2 text-xl font-semibold">{editing.name}</h2>
            </div>
            <button type="button" onClick={() => setEditing(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border text-muted-foreground transition hover:text-foreground" aria-label="Close editor">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <input value={editing.name} onChange={(event) => setEditing((current) => current ? { ...current, name: event.target.value } : current)} required minLength={2} className="h-12 rounded-2xl border bg-background px-4 text-sm outline-none focus:border-foreground" placeholder={`${editing.kind} name`} />
            <input value={editing.slug} onChange={(event) => setEditing((current) => current ? { ...current, slug: event.target.value } : current)} className="h-12 rounded-2xl border bg-background px-4 text-sm outline-none focus:border-foreground" placeholder="slug" />
            {editing.kind === "Category" ? (
              <textarea value={editing.description} onChange={(event) => setEditing((current) => current ? { ...current, description: event.target.value } : current)} rows={3} className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground lg:col-span-2" placeholder="Optional description" />
            ) : null}
          </div>
          <button disabled={isPending} className="mt-5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Save changes</button>
        </form>
      ) : null}
    </div>
  );
}

type TaxonomyPanelProps = {
  kind: TaxonomyKind;
  records: TaxonomyRecord[];
  total: number;
  page: number;
  pageCount: number;
  query: string;
  sort: { key: SortKey; direction: SortDirection };
  isPending: boolean;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSort: (key: SortKey) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (record: TaxonomyRecord) => void;
  onDelete: (record: TaxonomyRecord) => void;
};

function TaxonomyPanel({ kind, records, total, page, pageCount, query, sort, isPending, onQueryChange, onPageChange, onSort, onCreate, onEdit, onDelete }: TaxonomyPanelProps) {
  const noun = kind.toLowerCase();

  return (
    <section className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{kind}s</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Manage {noun}s</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, search, sort, update, and delete {noun}s.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{total} results</span>
      </div>

      <form onSubmit={onCreate} className="mt-5 grid gap-3 rounded-3xl border bg-background p-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <input name="name" required minLength={2} placeholder={`${kind} name`} className="h-11 rounded-2xl border bg-background px-4 text-sm outline-none focus:border-foreground" />
          <input name="slug" placeholder="Optional slug" className="h-11 rounded-2xl border bg-background px-4 text-sm outline-none focus:border-foreground" />
        </div>
        {kind === "Category" ? <textarea name="description" rows={3} placeholder="Optional description" className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" /> : null}
        <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          <Plus className="h-4 w-4" />
          Create {noun}
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={`Search ${noun}s...`} className="h-11 w-full rounded-full border bg-background pl-10 pr-4 text-sm outline-none focus:border-foreground" />
        </label>
        <p className="text-xs text-muted-foreground">Sorted by {sort.key} {sort.direction}</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <SortableHead label="Name" active={sort.key === "name"} onClick={() => onSort("name")} />
                <SortableHead label="Slug" active={sort.key === "slug"} onClick={() => onSort("slug")} />
                <SortableHead label="Assets" active={sort.key === "assets"} onClick={() => onSort("assets")} />
                <SortableHead label="Created" active={sort.key === "createdAt"} onClick={() => onSort("createdAt")} />
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((record) => (
                <tr key={record.id} className="bg-background/70">
                  <td className="px-4 py-4 font-medium">{record.name}</td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">/{record.slug}</td>
                  <td className="px-4 py-4 text-muted-foreground">{record._count.assets}</td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(record.createdAt)}</td>
                  <td className="px-4 py-4">
                    <RowActions record={record} isPending={isPending} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {records.map((record) => (
            <div key={record.id} className="rounded-2xl border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{record.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">/{record.slug}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{record._count.assets} assets · {formatDate(record.createdAt)}</p>
                </div>
                <RowActions record={record} isPending={isPending} onEdit={onEdit} onDelete={onDelete} compact />
              </div>
            </div>
          ))}
        </div>

        {records.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No {noun}s match this search.</p> : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {pageCount}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button type="button" onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page >= pageCount} className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function SortableHead({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <th className="px-4 py-3">
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 ${active ? "text-foreground" : ""}`}>
        {label}
        <ChevronsUpDown className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

function RowActions({ record, isPending, onEdit, onDelete, compact = false }: { record: TaxonomyRecord; isPending: boolean; onEdit: (record: TaxonomyRecord) => void; onDelete: (record: TaxonomyRecord) => void; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "flex-col" : "justify-end"}`}>
      <button type="button" onClick={() => onEdit(record)} disabled={isPending} className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-50">
        <Edit3 className="h-3.5 w-3.5" />
        Edit
      </button>
      <button type="button" onClick={() => onDelete(record)} disabled={isPending || record._count.assets > 0} className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50">
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
