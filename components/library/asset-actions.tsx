"use client";

import { Bookmark, Download, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

type AssetActionsProps = {
  assetId: string;
  initialBookmarked: boolean;
  canDownload: boolean;
  accessMessage?: string | null;
  requiredPlan: string;
};

type ApiResult<T> = {
  data?: T;
  error?: { message?: string };
};

export function AssetActions({
  assetId,
  initialBookmarked,
  canDownload,
  accessMessage,
  requiredPlan,
}: AssetActionsProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function requireSignIn() {
    const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/sign-in?redirect_url=${redirectUrl}`);
  }

  function toggleBookmark() {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      requireSignIn();
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/assets/${assetId}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
      });
      const result = (await response.json()) as ApiResult<{ bookmarked: boolean }>;

      if (!response.ok) {
        toast.error(result.error?.message ?? "Could not update bookmark");
        return;
      }

      setBookmarked(Boolean(result.data?.bookmarked));
      toast.success(result.data?.bookmarked ? "Asset bookmarked" : "Bookmark removed");
    });
  }

  function downloadAsset() {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      requireSignIn();
      return;
    }

    if (!canDownload) {
      toast.error(accessMessage ?? "Upgrade required to download this asset");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/assets/${assetId}/download`, { method: "POST" });
      const result = (await response.json()) as ApiResult<{ fileUrl: string }>;

      if (!response.ok || !result.data?.fileUrl) {
        toast.error(result.error?.message ?? "Download could not be started");
        return;
      }

      window.open(result.data.fileUrl, "_blank", "noopener,noreferrer");
      toast.success("Download started");
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={toggleBookmark}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
      >
        <Bookmark className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
      {canDownload ? (
        <button
          type="button"
          onClick={downloadAsset}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      ) : (
        <Link
          href={`/pricing?upgrade=${requiredPlan}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Lock className="h-4 w-4" />
          Upgrade
        </Link>
      )}
    </div>
  );
}
