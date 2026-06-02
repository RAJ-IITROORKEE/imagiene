import type { AssetAccessLevel, AssetType } from "@/constants/asset-types";

export type AssetCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type AssetTag = {
  id: string;
  name: string;
  slug: string;
};

export type Asset = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: AssetType;
  accessLevel: AssetAccessLevel;
  fileUrl: string;
  previewUrl: string;
  cloudinaryPublicId?: string | null;
  format: string;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  categoryId: string;
  category?: AssetCategory | null;
  tags: AssetTag[];
  isPublished: boolean;
  downloadCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type AssetFilters = {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  tag?: string;
  type?: AssetType;
  accessLevel?: AssetAccessLevel;
};
