"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";

type AdminAssetDeleteButtonProps = {
  assetId: string;
  title: string;
  disabled?: boolean;
};

export function AdminAssetDeleteButton({ assetId, title, disabled }: AdminAssetDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function deleteAsset() {
    startTransition(async () => {
      const response = await fetch(`/api/admin/assets/${assetId}`, { method: "DELETE" });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        toast.error(getAdminApiErrorMessage(result, "Asset could not be deleted."));
        return;
      }

      toast.success("Asset deleted");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="rounded-[var(--radius-sm)] p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
        aria-label={`Delete ${title}`}
        title="Delete asset"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={`delete-asset-${assetId}`}>
          <div className="w-full max-w-md rounded-[2rem] border bg-background p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-destructive">Warning</p>
            <h2 id={`delete-asset-${assetId}`} className="mt-3 text-2xl font-semibold tracking-tight">Delete this asset?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This will remove <span className="font-semibold text-foreground">{title}</span> from the public library by unpublishing it and marking it as deleted. Existing private R2 files stay protected.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteAsset}
                disabled={isPending}
                className="rounded-full bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-60"
              >
                {isPending ? "Deleting..." : "Yes, delete asset"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
