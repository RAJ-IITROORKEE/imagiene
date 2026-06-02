import Link from "next/link";

type EmptyDashboardStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyDashboardState({ title, description, actionLabel = "Browse library", actionHref = "/library" }: EmptyDashboardStateProps) {
  return (
    <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={actionHref} className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background">
        {actionLabel}
      </Link>
    </div>
  );
}
