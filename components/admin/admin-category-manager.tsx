"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import type { AdminCategoryRecord, AdminTagRecord } from "@/lib/admin-data";

type AdminCategoryManagerProps = {
  categories: AdminCategoryRecord[];
  tags: AdminTagRecord[];
};

type ApiResponse = {
  error?: string | { message?: string };
};

async function parseResponse(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function getErrorMessage(result: ApiResponse, fallback: string): string {
  if (typeof result.error === "string") {
    return result.error;
  }

  return result.error?.message ?? fallback;
}

export function AdminCategoryManager({ categories, tags }: AdminCategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function createEntity(event: FormEvent<HTMLFormElement>, endpoint: string, label: string) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
    };

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await parseResponse(response);

      if (!response.ok) {
        const message = getErrorMessage(result, `${label} could not be created.`);
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(`${label} created`);
      form.reset();
      router.refresh();
    });
  }

  function deleteEntity(endpoint: string, label: string) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await parseResponse(response);

      if (!response.ok) {
        const message = getErrorMessage(result, `${label} could not be deleted.`);
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(`${label} deleted`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 xl:col-span-2 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <section className="rounded-3xl border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Categories</h2>
        <form
          onSubmit={(event) => createEntity(event, "/api/admin/categories", "Category")}
          className="mt-5 grid gap-3"
        >
          <input name="name" required minLength={2} placeholder="Category name" className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          <input name="slug" placeholder="Optional slug" className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          <textarea name="description" rows={3} placeholder="Optional description" className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          <button disabled={isPending} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background disabled:opacity-60">Create category</button>
        </form>
        <div className="mt-6 divide-y rounded-2xl border">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">/{category.slug} · {category._count.assets} assets</p>
              </div>
              <button onClick={() => deleteEntity(`/api/admin/categories/${category.id}`, "Category")} disabled={isPending || category._count.assets > 0} className="rounded-full border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50">
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Tags</h2>
        <form
          onSubmit={(event) => createEntity(event, "/api/admin/tags", "Tag")}
          className="mt-5 grid gap-3"
        >
          <input name="name" required minLength={2} placeholder="Tag name" className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          <input name="slug" placeholder="Optional slug" className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          <input name="description" type="hidden" value="" readOnly />
          <button disabled={isPending} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background disabled:opacity-60">Create tag</button>
        </form>
        <div className="mt-6 divide-y rounded-2xl border">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{tag.name}</p>
                <p className="text-xs text-muted-foreground">/{tag.slug} · {tag._count.assets} assets</p>
              </div>
              <button onClick={() => deleteEntity(`/api/admin/tags/${tag.id}`, "Tag")} disabled={isPending || tag._count.assets > 0} className="rounded-full border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50">
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
