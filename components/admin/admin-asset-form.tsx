"use client";

import type { AssetAccessLevel, AssetType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import { ASSET_ACCESS_LEVELS, ASSET_TYPES } from "@/constants/asset-types";
import type { AdminAssetFormRecord } from "@/lib/admin-data";

type OptionRecord = {
  id: string;
  name: string;
};

type AdminAssetFormProps = {
  asset?: AdminAssetFormRecord | null;
  categories: OptionRecord[];
  tags: OptionRecord[];
};

function stringValue(value: string | number | null | undefined) {
  return value == null ? "" : String(value);
}

export function AdminAssetForm({ asset, categories, tags }: AdminAssetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(asset);

  function onSubmit(formData: FormData) {
    setError(null);

    const payload = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      type: String(formData.get("type") ?? "ICON") as AssetType,
      accessLevel: String(formData.get("accessLevel") ?? "FREE") as AssetAccessLevel,
      fileUrl: String(formData.get("fileUrl") ?? ""),
      previewUrl: String(formData.get("previewUrl") ?? ""),
      cloudinaryPublicId: String(formData.get("cloudinaryPublicId") ?? ""),
      format: String(formData.get("format") ?? ""),
      width: String(formData.get("width") ?? ""),
      height: String(formData.get("height") ?? ""),
      fileSize: String(formData.get("fileSize") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      tagIds: formData.getAll("tagIds").map(String),
      isPublished: formData.get("isPublished") === "on",
    };

    startTransition(async () => {
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
    });
  }

  return (
    <form action={onSubmit} className="grid gap-6 rounded-3xl border bg-background p-6 shadow-sm">
      {error ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Title
          <input name="title" required minLength={3} defaultValue={asset?.title} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Slug
          <input name="slug" defaultValue={asset?.slug} placeholder="Generated from title if blank" className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Description
        <textarea name="description" required minLength={10} rows={5} defaultValue={asset?.description} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          Type
          <select name="type" defaultValue={asset?.type ?? "ICON"} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground">
            {ASSET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Access
          <select name="accessLevel" defaultValue={asset?.accessLevel ?? "FREE"} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground">
            {ASSET_ACCESS_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Format
          <input name="format" required defaultValue={asset?.format} placeholder="SVG, PNG, PDF" className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Asset file URL
          <input name="fileUrl" type="url" required defaultValue={asset?.fileUrl} placeholder="Cloudinary secure URL or CDN path" className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Preview URL
          <input name="previewUrl" type="url" required defaultValue={asset?.previewUrl} placeholder="Cloudinary preview URL" className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Cloudinary public ID or selected path
        <input name="cloudinaryPublicId" defaultValue={asset?.cloudinaryPublicId ?? ""} placeholder="imagiene/assets/cell-diagram" className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        <span className="text-xs font-normal text-muted-foreground">Use the Cloudinary upload/select result here, then paste its file and preview secure URLs above.</span>
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          Width
          <input name="width" inputMode="numeric" defaultValue={stringValue(asset?.width)} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Height
          <input name="height" inputMode="numeric" defaultValue={stringValue(asset?.height)} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          File size bytes
          <input name="fileSize" inputMode="numeric" defaultValue={stringValue(asset?.fileSize)} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground" />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Category
          <select name="categoryId" required defaultValue={asset?.categoryId ?? ""} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground">
            <option value="" disabled>Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Tags
          <select name="tagIds" multiple defaultValue={asset?.tagIds ?? []} className="min-h-32 rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground">
            {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input name="isPublished" type="checkbox" defaultChecked={asset?.isPublished ?? false} className="size-4" />
        Publish asset
      </label>
      <div className="flex flex-wrap gap-3">
        <button disabled={isPending} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Saving..." : isEditing ? "Save asset" : "Create asset"}
        </button>
      </div>
    </form>
  );
}
