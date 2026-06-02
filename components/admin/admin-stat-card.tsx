type AdminStatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function AdminStatCard({ label, value, detail }: AdminStatCardProps) {
  return (
    <div className="rounded-3xl border bg-background p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}
    </div>
  );
}
