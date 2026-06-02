import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
  }

  return cloudinary;
}

export function requireCloudinary() {
  const client = getCloudinary();

  if (!client) {
    throw new Error("Cloudinary credentials are not configured");
  }

  return client;
}

export const cloudinaryFolders = {
  assets: process.env.CLOUDINARY_ASSET_FOLDER ?? "imagiene/assets",
  previews: process.env.CLOUDINARY_PREVIEW_FOLDER ?? "imagiene/previews",
} as const;
