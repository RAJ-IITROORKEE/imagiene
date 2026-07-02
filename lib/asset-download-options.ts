export const compressedDownloadSizes = [
  { id: "small", label: "Small", maxWidth: 640 },
  { id: "medium", label: "Medium", maxWidth: 1280 },
  { id: "large", label: "Large", maxWidth: 1920 },
] as const;

export type CompressedDownloadSize = (typeof compressedDownloadSizes)[number]["id"];
export type DownloadVariant = "original" | "compressed";

export function getCompressedDownloadSize(size: string | null | undefined) {
  return compressedDownloadSizes.find((option) => option.id === size) ?? compressedDownloadSizes[1];
}

export function scaledDimensions({
  width,
  height,
  maxWidth,
}: {
  width?: number | null;
  height?: number | null;
  maxWidth: number;
}) {
  if (!width || !height) {
    return null;
  }

  if (width <= maxWidth) {
    return { width, height };
  }

  return {
    width: maxWidth,
    height: Math.round((height / width) * maxWidth),
  };
}
