"use client";

import { Eye, Loader2, Mail, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statuses = ["NEW", "READ", "RESOLVED"] as const;

type ContactMessageActionsProps = {
  message: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: (typeof statuses)[number];
    createdAt: Date;
    updatedAt: Date;
  };
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ContactMessageActions({ message }: ContactMessageActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState(message.status);
  const [isPending, startTransition] = useTransition();

  function updateStatus(nextStatus: typeof status) {
    const previousStatus = status;
    setStatus(nextStatus);

    startTransition(async () => {
      const response = await fetch(`/api/admin/contact-messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        setStatus(previousStatus);
        toast.error(getAdminApiErrorMessage(result, "Status could not be updated."));
        return;
      }

      router.refresh();
    });
  }

  function deleteMessage() {
    startTransition(async () => {
      const response = await fetch(`/api/admin/contact-messages/${message.id}`, { method: "DELETE" });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        toast.error(getAdminApiErrorMessage(result, "Message could not be deleted."));
        return;
      }

      toast.success("Contact message deleted");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={() => { setOpen(true); setConfirmDelete(true); }}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setConfirmDelete(false); }}>
        <DialogContent className="max-w-2xl p-0">
          <div className="border-b bg-muted/30 p-6">
            <DialogHeader>
              <DialogDescription>Contact message</DialogDescription>
              <DialogTitle>{message.subject}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="grid gap-5 p-6">
            <div className="grid gap-3 rounded-2xl border bg-background p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sender</p>
                <p className="mt-2 font-semibold">{message.name}</p>
                <a className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" href={`mailto:${message.email}`}>
                  <Mail className="h-3.5 w-3.5" />
                  {message.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timeline</p>
                <p className="mt-2 text-sm">Received {formatDate(message.createdAt)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Updated {formatDate(message.updatedAt)}</p>
              </div>
            </div>

            <label className="grid gap-2 text-sm font-semibold">
              Status
              <select
                value={status}
                disabled={isPending}
                onChange={(event) => updateStatus(event.target.value as typeof status)}
                className="h-11 rounded-2xl border bg-background px-4 font-normal outline-none focus:border-primary"
              >
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <div className="rounded-2xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Full message</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{message.message}</p>
            </div>

            {confirmDelete ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="font-semibold text-destructive">Delete this message?</p>
                <p className="mt-1 text-sm text-muted-foreground">This removes the contact submission from the admin inbox.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="destructive" onClick={deleteMessage} disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete message
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} disabled={isPending}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>
                    <Mail className="h-4 w-4" />
                    Reply by email
                  </a>
                </Button>
                <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
