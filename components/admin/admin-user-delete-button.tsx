"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";

type AdminUserDeleteButtonProps = {
  userId: string;
  label: string;
};

export function AdminUserDeleteButton({ userId, label }: AdminUserDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function deleteUser() {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        toast.error(getAdminApiErrorMessage(result, "User could not be removed."));
        return;
      }

      toast.success("User removed");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-red-500/25 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-500/10 dark:text-red-300"
      >
        <Trash2 className="mr-1.5 size-3.5" />
        Remove
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={`delete-user-${userId}`}>
          <div className="w-full max-w-md rounded-[2rem] border bg-background p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600 dark:text-red-300">Warning</p>
            <h2 id={`delete-user-${userId}`} className="mt-3 text-2xl font-semibold tracking-tight">Remove this user?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This removes {label} from the app and attempts to remove their Clerk account. Their downloads, bookmarks, subscriptions, payments, and admin audit rows tied to this user will also be deleted.
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
                onClick={deleteUser}
                disabled={isPending}
                className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "Removing..." : "Yes, remove user"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
