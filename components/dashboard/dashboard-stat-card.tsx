type DashboardStatCardProps = {
  label: string;
  value: string | number;
  detail: string;
};

export function DashboardStatCard({ label, value, detail }: DashboardStatCardProps) {
  return (
    <div className="rounded-3xl border bg-background p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
