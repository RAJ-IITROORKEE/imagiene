export const ASSET_ACCESS_LEVELS = ["FREE", "PRO", "PREMIUM"] as const;

export type AssetAccessLevel = (typeof ASSET_ACCESS_LEVELS)[number];

export const ASSET_TYPES = [
  "ICON",
  "ILLUSTRATION",
  "DIAGRAM",
  "VECTOR",
  "PNG",
  "SVG",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const assetAccessLevelLabels: Record<AssetAccessLevel, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
};

export const assetTypeLabels: Record<AssetType, string> = {
  ICON: "Icon",
  ILLUSTRATION: "Illustration",
  DIAGRAM: "Diagram",
  VECTOR: "Vector",
  PNG: "PNG",
  SVG: "SVG",
};
