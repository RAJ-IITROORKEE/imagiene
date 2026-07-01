export function getProtectedAssetPreviewUrl(assetId: string) {
  return `/api/assets/${encodeURIComponent(assetId)}/preview`;
}

export function withProtectedAssetPreviewUrl<T extends { id: string; previewUrl: string }>(asset: T): T {
  return {
    ...asset,
    previewUrl: getProtectedAssetPreviewUrl(asset.id),
  };
}
