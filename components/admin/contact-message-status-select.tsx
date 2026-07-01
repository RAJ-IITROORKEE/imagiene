"use client";

import { useState, useTransition } from "react";

const statuses = ["NEW", "READ", "RESOLVED"] as const;

type ContactMessageStatusSelectProps = {
  messageId: string;
  status: (typeof statuses)[number];
};

export function ContactMessageStatusSelect({ messageId, status }: ContactMessageStatusSelectProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-1">
      <select
        value={currentStatus}
        disabled={isPending}
        className="h-9 rounded-[var(--radius-md)] border bg-background px-3 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:opacity-60"
        onChange={(event) => {
          const nextStatus = event.target.value as typeof currentStatus;
          const previousStatus = currentStatus;
          setCurrentStatus(nextStatus);
          setError(null);
          startTransition(async () => {
            const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) {
              setCurrentStatus(previousStatus);
              setError("Update failed");
            }
          });
        }}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {error ? <p className="text-[11px] font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
