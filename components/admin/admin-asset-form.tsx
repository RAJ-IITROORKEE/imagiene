"use client";

import type { AssetAccessLevel, AssetType } from "@/lib/generated/prisma";
import { CheckCircle2, FileImage, ImagePlus, Loader2, SearchCheck, ShieldCheck, Sparkles, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import { ASSET_ACCESS_LEVELS, assetAccessLevelLabels } from "@/constants/asset-types";
import type { AdminAssetFormRecord } from "@/lib/admin-data";
import { createSlug } from "@/lib/slug";

type OptionRecord = {
  id: string;
  name: string;
};

type AdminAssetFormProps = {
  asset?: AdminAssetFormRecord | null;
  categories: OptionRecord[];
  tags: OptionRecord[];
};

type R2UploadResponse = {
  data?: {
    key: string;
    uploadUrl: string;
    publicUrl: string | null;
    headers: Record<string, string>;
  };
  error?: { message?: string };
};

type AvailabilityResponse = {
  data?: {
    slug: string;
    titleAvailable: boolean;
    slugAvailable: boolean;
  };
  error?: { message?: string };
};

type AssetMetadata = {
  format: string;
  type: AssetType;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType: string;
};

type AvailabilityState = {
  status: "idle" | "checking" | "available" | "taken" | "error";
  message: string;
};

function formatBytes(value?: number | null) {
  if (!value) {
    return "Not available";
  }

  if (value < 1024 * 1024) {
    return `${Math.ceil(value / 1024)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function imageFormat(file: File) {
  const extension = file.name.split(".").pop()?.trim().toUpperCase();

  if (extension) {
    return extension.slice(0, 20);
  }

  return (file.type.split("/").pop() ?? "IMAGE").toUpperCase().slice(0, 20);
}

function assetTypeFromFile(file: File): AssetType {
  const format = imageFormat(file);

  if (format === "SVG" || file.type === "image/svg+xml") {
    return "SVG";
  }

  if (format === "PNG" || file.type === "image/png") {
    return "PNG";
  }

  return "ILLUSTRATION";
}

function titleFromFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return withoutExtension.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function cleanTagInput(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 60);
}

function readImageDimensions(file: File) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth || undefined, height: image.naturalHeight || undefined });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

async function uploadR2File(file: File, purpose: "asset" | "preview") {
  const signResponse = await fetch("/api/admin/r2/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    }),
  });
  const signed = (await signResponse.json().catch(() => ({}))) as R2UploadResponse;

  if (!signResponse.ok || !signed.data) {
    throw new Error(signed.error?.message ?? "Could not prepare protected upload.");
  }

  const uploadResponse = await fetch(signed.data.uploadUrl, {
    method: "PUT",
    headers: signed.data.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Protected upload failed. Check bucket CORS and token permissions.");
  }

  return signed.data;
}

export function AdminAssetForm({ asset, categories, tags }: AdminAssetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AssetMetadata | null>(
    asset
      ? {
          format: asset.format,
          type: asset.type,
          width: asset.width ?? undefined,
          height: asset.height ?? undefined,
          fileSize: asset.fileSize ?? undefined,
          mimeType: asset.format,
        }
      : null,
  );
  const [formState, setFormState] = useState({
    title: asset?.title ?? "",
    description: asset?.description ?? "",
    accessLevel: (asset?.accessLevel ?? "FREE") as AssetAccessLevel,
    categoryId: asset?.categoryId ?? "",
    tagNames: asset?.tags.map((tag) => tag.name) ?? [],
    isPublished: asset?.isPublished ?? false,
  });
  const [tagInput, setTagInput] = useState("");
  const [slug, setSlug] = useState(asset?.slug ?? "");
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: asset ? "available" : "idle",
    message: asset ? "Current asset name" : "Name check starts after 3 characters",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const availabilityTimerRef = useRef<number | null>(null);
  const availabilityRequestRef = useRef(0);
  const isEditing = Boolean(asset);
  const hasAssetFile = Boolean(assetFile || asset?.fileUrl);
  const detailsDisabled = !isEditing && !assetFile;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      if (availabilityTimerRef.current) {
        window.clearTimeout(availabilityTimerRef.current);
      }
    };
  }, []);

  function updatePreview(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

  function scheduleAvailabilityCheck(title: string) {
    const cleanTitle = title.trim();
    const generatedSlug = createSlug(cleanTitle);
    setSlug(generatedSlug);

    if (availabilityTimerRef.current) {
      window.clearTimeout(availabilityTimerRef.current);
    }

    if (cleanTitle.length < 3) {
      setAvailability({ status: "idle", message: "Name check starts after 3 characters" });
      return;
    }

    setAvailability({ status: "checking", message: "Checking unique name and slug..." });
    const requestId = availabilityRequestRef.current + 1;
    availabilityRequestRef.current = requestId;

    availabilityTimerRef.current = window.setTimeout(async () => {
      const params = new URLSearchParams({ check: "availability", title: cleanTitle });

      if (asset?.id) {
        params.set("assetId", asset.id);
      }

      try {
        const response = await fetch(`/api/admin/assets?${params.toString()}`);
        const payload = (await response.json()) as AvailabilityResponse;

        if (requestId !== availabilityRequestRef.current) {
          return;
        }

        if (!response.ok || !payload.data) {
          setAvailability({ status: "error", message: payload.error?.message ?? "Could not check this name" });
          return;
        }

        setSlug(payload.data.slug);
        setAvailability(
          payload.data.titleAvailable
            ? { status: "available", message: "Name is available. Slug will be generated automatically." }
            : { status: "taken", message: "title exists already, rename it okay" },
        );
      } catch {
        if (requestId === availabilityRequestRef.current) {
          setAvailability({ status: "error", message: "Could not check this name" });
        }
      }
    }, 400);
  }

  function onTitleChange(value: string) {
    setFormState((current) => ({ ...current, title: value }));
    scheduleAvailabilityCheck(value);
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAssetFile(null);
      updatePreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Upload one image file only");
      event.target.value = "";
      return;
    }

    const dimensions = await readImageDimensions(file);
    setAssetFile(file);
    updatePreview(file);
    setMetadata({
      format: imageFormat(file),
      type: assetTypeFromFile(file),
      width: dimensions.width,
      height: dimensions.height,
      fileSize: file.size,
      mimeType: file.type || "image/*",
    });

    if (!isEditing && !formState.title.trim()) {
      const nextTitle = titleFromFileName(file.name);

      if (nextTitle) {
        setFormState((current) => ({ ...current, title: nextTitle }));
        scheduleAvailabilityCheck(nextTitle);
      }
    }
  }

  function clearFile() {
    setAssetFile(null);
    updatePreview(null);
    setMetadata(
      asset
        ? {
            format: asset.format,
            type: asset.type,
            width: asset.width ?? undefined,
            height: asset.height ?? undefined,
            fileSize: asset.fileSize ?? undefined,
            mimeType: asset.format,
          }
        : null,
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function addTag(value: string) {
    const nextTag = cleanTagInput(value);

    if (nextTag.length < 2) {
      return;
    }

    setFormState((current) => {
      if (current.tagNames.some((tag) => tag.toLowerCase() === nextTag.toLowerCase()) || current.tagNames.length >= 20) {
        return current;
      }

      return { ...current, tagNames: [...current.tagNames, nextTag] };
    });
    setTagInput("");
  }

  function removeTag(tagName: string) {
    setFormState((current) => ({
      ...current,
      tagNames: current.tagNames.filter((tag) => tag.toLowerCase() !== tagName.toLowerCase()),
    }));
  }

  function onTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();
    addTag(tagInput);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isEditing && !assetFile) {
      setError("Upload one protected image before adding asset details.");
      toast.error("Upload one protected image first");
      return;
    }

    if (availability.status === "taken") {
      setError("title exists already, rename it okay");
      toast.error("title exists already, rename it okay");
      return;
    }

    startTransition(async () => {
      setIsUploading(true);

      try {
        const [uploadedAsset, uploadedPreview] = assetFile
          ? await Promise.all([uploadR2File(assetFile, "asset"), uploadR2File(assetFile, "preview")])
          : [null, null];

        const payload = {
          title: formState.title,
          description: formState.description,
          type: metadata?.type ?? asset?.type ?? "ILLUSTRATION",
          accessLevel: formState.accessLevel,
          fileUrl: uploadedAsset?.key ?? asset?.fileUrl ?? "",
          previewUrl: uploadedPreview?.key ?? asset?.previewUrl ?? "",
          format: metadata?.format ?? asset?.format ?? "IMAGE",
          width: metadata?.width ? String(metadata.width) : "",
          height: metadata?.height ? String(metadata.height) : "",
          fileSize: metadata?.fileSize ? String(metadata.fileSize) : "",
          categoryId: formState.categoryId,
          tagNames: formState.tagNames,
          isPublished: formState.isPublished,
        };

        if (!payload.fileUrl || !payload.previewUrl) {
          throw new Error("Protected image upload is required.");
        }

        const response = await fetch(isEditing ? `/api/admin/assets/${asset?.id}` : "/api/admin/assets", {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await parseAdminApiResponse(response);

        if (!response.ok) {
          const message = getAdminApiErrorMessage(result, "Asset could not be saved.");
          setError(message);
          toast.error(message);
          return;
        }

        toast.success(isEditing ? "Asset updated" : "Asset created");
        router.push("/admin/assets");
        router.refresh();
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : "Asset upload failed.";
        setError(message);
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    });
  }

  const previewBackground = previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined;
  const availabilityTone = availability.status === "taken" || availability.status === "error" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";

  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
      {error ? <p className="m-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p> : null}

      <div className="grid gap-0 xl:grid-cols-[360px_1fr]">
        <aside className="border-b bg-muted/25 p-6 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Protected asset
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Upload image first</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">One image is uploaded to private storage for both preview and download. Public pages only use protected app routes.</p>

          <label htmlFor="assetFile" className="mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed bg-background p-5 text-center transition hover:border-primary hover:bg-primary/5">
            {previewUrl ? (
              <span className="h-44 w-full rounded-3xl bg-muted bg-cover bg-center shadow-inner" style={previewBackground} />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <ImagePlus className="h-10 w-10" />
              </span>
            )}
            <span className="mt-4 font-semibold">{assetFile ? assetFile.name : isEditing ? "Replace protected image" : "Choose protected image"}</span>
            <span className="mt-1 text-xs text-muted-foreground">PNG, SVG, JPG, WebP, or any image file</span>
          </label>
          <input ref={fileInputRef} id="assetFile" type="file" accept="image/*" onChange={onFileChange} className="sr-only" />

          {assetFile ? (
            <button type="button" onClick={clearFile} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              <X className="h-4 w-4" />
              Remove selected image
            </button>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-3xl border bg-background p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Auto metadata</div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <span>Format <strong className="block text-foreground">{metadata?.format ?? "-"}</strong></span>
              <span>Type <strong className="block text-foreground">{metadata?.type ?? "-"}</strong></span>
              <span>Size <strong className="block text-foreground">{formatBytes(metadata?.fileSize)}</strong></span>
              <span>Dimensions <strong className="block text-foreground">{metadata?.width && metadata.height ? `${metadata.width} x ${metadata.height}` : "Not available"}</strong></span>
            </div>
          </div>
        </aside>

        <div className="grid gap-6 p-6 sm:p-8">
          <div className="rounded-3xl border bg-background p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 2</p>
                <h3 className="mt-1 text-xl font-semibold">Name and access</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {hasAssetFile ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <UploadCloud className="h-4 w-4" />}
                {hasAssetFile ? "Image ready" : "Upload required"}
              </span>
            </div>

            <div className="mt-5 grid gap-5">
              <label className="grid gap-2 text-sm font-medium">
                Asset name
                <input value={formState.title} onChange={(event) => onTitleChange(event.target.value)} disabled={detailsDisabled} required minLength={3} placeholder="Microscope cell illustration" className="h-12 rounded-2xl border bg-background px-4 font-normal outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground" />
              </label>
              <div className="grid gap-2 rounded-2xl border bg-muted/30 p-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-medium">Generated slug</p>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">/{slug || "asset-slug"}</p>
                </div>
                <p className={`inline-flex items-center gap-2 text-xs font-semibold ${availabilityTone}`}>
                  {availability.status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
                  {availability.message}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {ASSET_ACCESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    disabled={detailsDisabled}
                    onClick={() => setFormState((current) => ({ ...current, accessLevel: level }))}
                    className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${formState.accessLevel === level ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50"}`}
                  >
                    <span className="text-sm font-semibold">{assetAccessLevelLabels[level]}</span>
                    <span className="mt-1 block text-xs opacity-80">{level === "FREE" ? "Visible to signed-in users" : `${level} plan required`}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium lg:col-span-2">
              Description <span className="text-xs font-normal text-muted-foreground">Optional</span>
              <textarea value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} disabled={detailsDisabled} rows={4} placeholder="Short context, use case, or scientific topic for this image." className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground" />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Category
              <select value={formState.categoryId} onChange={(event) => setFormState((current) => ({ ...current, categoryId: event.target.value }))} disabled={detailsDisabled} required className="h-12 rounded-2xl border bg-background px-4 font-normal outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
                <option value="" disabled>Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
              <span>
                Publish asset
                <span className="mt-1 block text-xs font-normal text-muted-foreground">Keep off while reviewing metadata.</span>
              </span>
              <input type="checkbox" checked={formState.isPublished} onChange={(event) => setFormState((current) => ({ ...current, isPublished: event.target.checked }))} disabled={detailsDisabled} className="size-5" />
            </label>
          </div>

          <div className="rounded-3xl border bg-background p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Tags</h3>
                <p className="mt-1 text-sm text-muted-foreground">Type a tag and press Enter or comma. New tags are created automatically.</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{formState.tagNames.length} tags</span>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={onTagKeyDown}
                  onBlur={() => addTag(tagInput)}
                  disabled={detailsDisabled || formState.tagNames.length >= 20}
                  list="asset-tag-suggestions"
                  placeholder="Add tags like influenza, microscopy, cell biology"
                  className="h-11 flex-1 rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                />
                <button type="button" onClick={() => addTag(tagInput)} disabled={detailsDisabled || formState.tagNames.length >= 20} className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60">
                  Add tag
                </button>
              </div>
              <datalist id="asset-tag-suggestions">
                {tags.map((tag) => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <div className="flex min-h-10 flex-wrap gap-2">
                {formState.tagNames.length ? formState.tagNames.map((tagName) => (
                  <button key={tagName} type="button" onClick={() => removeTag(tagName)} disabled={detailsDisabled} className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60">
                    {tagName}
                    <X className="h-3.5 w-3.5" />
                  </button>
                )) : <p className="text-sm text-muted-foreground">No tags yet. Assets can be saved without tags.</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileImage className="h-4 w-4" />
              Private R2 keys are generated automatically and never entered manually.
            </div>
            <button disabled={isPending || isUploading || detailsDisabled} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
              {isPending || isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isPending || isUploading ? "Saving protected asset..." : isEditing ? "Save asset" : "Create asset"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
