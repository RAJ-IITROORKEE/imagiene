"use client";

import {
  Bookmark,
  Check,
  Copy,
  Download,
  Heart,
  Lock,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  compressedDownloadFormats,
  compressedDownloadSizes,
  type CompressedDownloadFormat,
  type CompressedDownloadSize,
  type DownloadVariant,
} from "@/lib/asset-download-options";

type AssetActionsProps = {
  assetId: string;
  title?: string;
  accessLevel?: "FREE" | "PRO" | "PREMIUM";
  initialBookmarked: boolean;
  initialLiked?: boolean;
  initialLikeCount?: number;
  canDownload: boolean;
  accessMessage?: string | null;
  originalFileSize?: string;
  originalDimensions?: string;
  originalFormat?: string;
  compressedOptions?: Array<{
    id: CompressedDownloadSize;
    label: string;
    dimensions: string;
  }>;
};

type ApiResult<T> = {
  data?: T;
  error?: { message?: string };
};

function shareText(title: string, url: string) {
  return `${title} on Imagiene ${url}`;
}

export function AssetActions({
  assetId,
  title = "Asset",
  accessLevel = "FREE",
  initialBookmarked,
  initialLiked = false,
  initialLikeCount = 0,
  canDownload,
  accessMessage,
  originalFileSize = "Not available",
  originalDimensions = "Not available",
  originalFormat = "Original",
  compressedOptions = compressedDownloadSizes.map((option) => ({
    id: option.id,
    label: option.label,
    dimensions: `${option.maxWidth}px wide`,
  })),
}: AssetActionsProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadVariant, setDownloadVariant] = useState<DownloadVariant>("original");
  const [compressedFormat, setCompressedFormat] = useState<CompressedDownloadFormat>("webp");
  const [compressedSize, setCompressedSize] = useState<CompressedDownloadSize>("medium");
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

    const nextBookmarked = !bookmarked;

    setBookmarked(nextBookmarked);
    startTransition(async () => {
      const response = await fetch(`/api/assets/${assetId}/bookmark`, {
        method: nextBookmarked ? "POST" : "DELETE",
      });
      const result = (await response.json()) as ApiResult<{ bookmarked: boolean }>;

      if (!response.ok) {
        setBookmarked(!nextBookmarked);
        toast.error(result.error?.message ?? "Could not update bookmark");
        return;
      }

      setBookmarked(Boolean(result.data?.bookmarked));
    });
  }

  function toggleLike() {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      requireSignIn();
      return;
    }

    const nextLiked = !liked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);
    startTransition(async () => {
      const response = await fetch(`/api/assets/${assetId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      const result = (await response.json()) as ApiResult<{ liked: boolean; likeCount: number }>;

      if (!response.ok) {
        setLiked(!nextLiked);
        setLikeCount(likeCount);
        toast.error(result.error?.message ?? "Could not update like");
        return;
      }

      setLiked(Boolean(result.data?.liked));
      setLikeCount(result.data?.likeCount ?? likeCount);
    });
  }

  function openDownloadDialog() {
    if (!canDownload) {
      toast.error(accessMessage ?? "Upgrade required to download this asset");
      return;
    }

    setDownloadVariant("original");
    setDownloadOpen(true);
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
      const response = await fetch(`/api/assets/${assetId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: downloadVariant, format: compressedFormat, size: compressedSize }),
      });
      const result = (await response.json()) as ApiResult<{ downloadUrl: string }>;

      if (!response.ok || !result.data?.downloadUrl) {
        toast.error(result.error?.message ?? "Download could not be started");
        return;
      }

      window.open(result.data.downloadUrl, "_blank", "noopener,noreferrer");
      setDownloadOpen(false);
      toast.success("Download started");
    });
  }

  async function copyShareLink() {
    const url = window.location.href;

    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  }

  async function nativeShare() {
    const url = window.location.href;

    if (!navigator.share) {
      setShareOpen(true);
      return;
    }

    await navigator.share({ title, text: title, url });
  }

  async function openInstagram() {
    await copyShareLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  function openWhatsApp() {
    const text = shareText(title, window.location.href);

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  const downloadLabel = accessLevel === "FREE" ? "Free download" : "Download";
  const upgradeLabel = accessLevel === "PREMIUM" ? "Upgrade to Premium" : accessLevel === "PRO" ? "Upgrade to Pro" : "Download unavailable";
  const selectedCompressedOption =
    compressedOptions.find((option) => option.id === compressedSize) ?? compressedOptions[1];
  const selectedCompressedFormat =
    compressedDownloadFormats.find((option) => option.id === compressedFormat) ?? compressedDownloadFormats[2];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={toggleBookmark}
          className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10"
          aria-pressed={bookmarked}
        >
          <Bookmark className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
          {bookmarked ? "Saved" : "Save"}
        </button>

        <button
          type="button"
          onClick={toggleLike}
          className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10"
          aria-pressed={liked}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          {liked ? "Liked" : "Like"}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <div className="mt-3">
        {canDownload ? (
          <button
            type="button"
            onClick={openDownloadDialog}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloadLabel}
          </button>
        ) : (
          <Link
            href="/#pricing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Lock className="h-4 w-4" />
            {upgradeLabel}
          </Link>
        )}
      </div>

      {downloadOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose download quality"
            className="w-full max-w-xl overflow-hidden rounded-[2rem] border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Download image
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">Choose file quality</h2>
              </div>
              <button
                type="button"
                onClick={() => setDownloadOpen(false)}
                className="rounded-full border p-2 transition hover:bg-muted"
                aria-label="Close download dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <button
                type="button"
                onClick={() => setDownloadVariant("original")}
                className="rounded-[1.25rem] border bg-background p-4 text-left transition hover:border-primary/50 hover:bg-muted/30 aria-pressed:border-primary aria-pressed:bg-primary/10"
                aria-pressed={downloadVariant === "original"}
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block font-semibold">Original</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {originalFormat} · {originalDimensions} · {originalFileSize}
                    </span>
                  </span>
                  {downloadVariant === "original" ? <Check className="h-5 w-5 text-primary" /> : <Download className="h-5 w-5 text-primary" />}
                </span>
              </button>

              <div className="rounded-[1.25rem] border bg-muted/25 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <button
                      type="button"
                      onClick={() => setDownloadVariant("compressed")}
                      className="text-left font-semibold transition hover:text-primary"
                    >
                      Compressed
                    </button>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Smaller file for web, slides, notes, and quick sharing.
                    </p>
                  </div>
                  <span className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {selectedCompressedFormat.label} · {selectedCompressedOption?.dimensions}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {compressedDownloadFormats.map((option) => {
                    const active = downloadVariant === "compressed" && compressedFormat === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setDownloadVariant("compressed");
                          setCompressedFormat(option.id);
                        }}
                        className="rounded-xl border bg-background p-3 text-left text-sm transition hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10"
                        aria-pressed={active}
                      >
                        <span className="flex items-center justify-between gap-2 font-semibold">
                          {option.label}
                          {active ? <Check className="h-4 w-4 text-primary" /> : null}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          .{option.extension}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {compressedDownloadSizes.map((option) => {
                    const resolvedOption = compressedOptions.find((item) => item.id === option.id);
                    const active = compressedSize === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setDownloadVariant("compressed");
                          setCompressedSize(option.id);
                        }}
                        className="rounded-xl border bg-background p-3 text-left text-sm transition hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10"
                        aria-pressed={active}
                      >
                        <span className="flex items-center justify-between gap-2 font-semibold">
                          {option.label}
                          {active ? <Check className="h-4 w-4 text-primary" /> : null}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {resolvedOption?.dimensions ?? `${option.maxWidth}px wide`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={downloadAsset}
                disabled={isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Download {downloadVariant === "original" ? "original" : `compressed ${selectedCompressedFormat.label}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shareOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Share image"
            className="w-full max-w-md overflow-hidden rounded-[2rem] border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Share</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">Send this image</h2>
              </div>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="rounded-full border p-2 transition hover:bg-muted"
                aria-label="Close share dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 p-5">
              <button
                type="button"
                onClick={nativeShare}
                className="inline-flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition hover:bg-muted"
              >
                <Share2 className="h-5 w-5 text-primary" />
                Share with device
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                className="inline-flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition hover:bg-muted"
              >
                <MessageCircle className="h-5 w-5 text-primary" />
                Share on WhatsApp
              </button>
              <button
                type="button"
                onClick={openInstagram}
                className="inline-flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition hover:bg-muted"
              >
                <Share2 className="h-5 w-5 text-primary" />
                Copy link and open Instagram
              </button>
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition hover:bg-muted"
              >
                <Copy className="h-5 w-5 text-primary" />
                Copy share link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
