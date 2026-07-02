"use client";

import { ImageIcon, Info, X } from "lucide-react";
import { useState } from "react";

type AssetDetailPreviewProps = {
  title: string;
  previewUrl: string;
  details: Array<{ label: string; value: string }>;
};

export function AssetDetailPreview({ title, previewUrl, details }: AssetDetailPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border bg-muted text-left shadow-sm outline-none transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring lg:min-h-[620px]"
        aria-label={`View metadata for ${title}`}
      >
        <span
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.025]"
          style={{ backgroundImage: `url(${previewUrl})` }}
        />
        <span className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border bg-background/88 p-4 shadow-sm backdrop-blur sm:inset-x-6 sm:bottom-6">
          <span className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold">Click image for file details</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Size, format, dimensions, and protected delivery metadata.
              </span>
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-cyan-100">
              <Info className="h-5 w-5" />
            </span>
          </span>
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} metadata`}
            className="w-full max-w-4xl overflow-hidden rounded-[2rem] border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Image metadata
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border p-2 transition hover:bg-muted"
                aria-label="Close metadata dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-muted p-4 sm:p-5">
                <div
                  className="aspect-[4/3] rounded-[1.5rem] border bg-background bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${previewUrl})` }}
                  aria-label={title}
                />
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3 rounded-[1.25rem] border bg-muted/30 p-4">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Preview is optimized for browsing. Original files are only delivered through protected downloads.
                  </p>
                </div>
                <dl className="grid gap-3">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between gap-4 rounded-xl border p-3">
                      <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                      <dd className="text-right text-sm font-semibold">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
