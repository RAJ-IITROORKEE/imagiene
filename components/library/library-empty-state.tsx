import Link from "next/link";

type LibraryEmptyStateProps = {
  title?: string;
  description?: string;
};

export function LibraryEmptyState({
  title = "No assets found",
  description = "Try a broader search or remove a filter to see more scientific assets.",
}: LibraryEmptyStateProps) {
  return (
    <div className="rounded-3xl border bg-muted/20 p-10 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Link
        href="/library"
        className="mt-6 inline-flex rounded-full border px-5 py-3 text-sm font-semibold transition hover:bg-background"
      >
        Reset library view
      </Link>
    </div>
  );
}
