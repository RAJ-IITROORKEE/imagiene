type AdminSearchFormProps = {
  placeholder: string;
  defaultValue?: string;
  status?: string;
  showAssetStatus?: boolean;
};

export function AdminSearchForm({
  placeholder,
  defaultValue,
  status,
  showAssetStatus,
}: AdminSearchFormProps) {
  return (
    <form className="grid gap-3 rounded-3xl border bg-background p-4 shadow-sm sm:grid-cols-[1fr_auto_auto]">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
      />
      {showAssetStatus ? (
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      ) : null}
      <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90">
        Filter
      </button>
    </form>
  );
}
