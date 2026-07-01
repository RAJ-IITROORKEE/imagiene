"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  ASSET_ACCESS_LEVELS,
  ASSET_TYPES,
  assetAccessLevelLabels,
  assetTypeLabels,
} from "@/constants/asset-types";
import type { LibraryQuery } from "@/lib/library-data";

type LibraryFiltersProps = {
  query: LibraryQuery;
};

export function LibraryFilters({ query }: LibraryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function clearFilters() {
    startTransition(() => router.push(pathname));
  }

  return (
    <form className="flex flex-col gap-3 border-y bg-card px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between" action={pathname}>
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
        <select
          name="type"
          defaultValue={query.type ?? ""}
          className="h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="">All types</option>
          {ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {assetTypeLabels[type]}
            </option>
          ))}
        </select>
        <select
          name="accessLevel"
          defaultValue={query.accessLevel ?? ""}
          className="h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="">All access</option>
          {ASSET_ACCESS_LEVELS.map((level) => (
            <option key={level} value={level}>
              {assetAccessLevelLabels[level]}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={query.sort}
          className="h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="title">Title</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-muted-foreground lg:block">Refine results</p>
        <div className="flex gap-2">
          <button
            type="submit"
            className="h-10 rounded-[var(--radius-md)] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="h-10 rounded-[var(--radius-md)] border px-5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
