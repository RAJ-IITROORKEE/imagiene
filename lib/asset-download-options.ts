export const compressedDownloadSizes = [
  { id: "small", label: "Small", maxWidth: 640 },
  { id: "medium", label: "Medium", maxWidth: 1280 },
  { id: "large", label: "Large", maxWidth: 1920 },
] as const;

export const compressedDownloadFormats = [
  { id: "png", label: "PNG", extension: "png", contentType: "image/png" },
  { id: "jpg", label: "JPG", extension: "jpg", contentType: "image/jpeg" },
  { id: "webp", label: "WebP", extension: "webp", contentType: "image/webp" },
] as const;

export type CompressedDownloadSize = (typeof compressedDownloadSizes)[number]["id"];
export type CompressedDownloadFormat = (typeof compressedDownloadFormats)[number]["id"];
export type DownloadVariant = "original" | "compressed";

export function getCompressedDownloadSize(size: string | null | undefined) {
  return compressedDownloadSizes.find((option) => option.id === size) ?? compressedDownloadSizes[1];
}

export function getCompressedDownloadFormat(format: string | null | undefined) {
  return compressedDownloadFormats.find((option) => option.id === format) ?? compressedDownloadFormats[2];
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
