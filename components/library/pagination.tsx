import Link from "next/link";

type PaginationProps = {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

function buildHref(basePath: string, searchParams: PaginationProps["searchParams"], page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue && key !== "page") {
      params.set(key, firstValue);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({ page, pageCount, basePath, searchParams }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border bg-muted/20 p-4 text-sm">
      <Link
        href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className="rounded-full border px-4 py-2 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        Previous
      </Link>
      <span className="text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Link
        href={buildHref(basePath, searchParams, Math.min(pageCount, page + 1))}
        aria-disabled={page >= pageCount}
        className="rounded-full border px-4 py-2 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        Next
      </Link>
    </div>
  );
}
