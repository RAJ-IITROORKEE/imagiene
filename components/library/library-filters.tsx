"use client";

import { Search } from "lucide-react";
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
    <form className="rounded-3xl border bg-muted/20 p-4 sm:p-5" action={pathname}>
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_160px_auto]">
        <label className="relative block">
          <span className="sr-only">Search assets</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Search diagrams, icons, vectors..."
            className="h-11 w-full rounded-full border bg-background pl-11 pr-4 text-sm outline-none transition focus:border-foreground"
          />
        </label>
        <select
          name="type"
          defaultValue={query.type ?? ""}
          className="h-11 rounded-full border bg-background px-4 text-sm outline-none transition focus:border-foreground"
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
          className="h-11 rounded-full border bg-background px-4 text-sm outline-none transition focus:border-foreground"
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
          className="h-11 rounded-full border bg-background px-4 text-sm outline-none transition focus:border-foreground"
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="title">Title</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="h-11 rounded-full border px-5 text-sm font-semibold transition hover:bg-background disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
