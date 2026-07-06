import { createHash, createHmac, randomUUID } from "crypto";

type R2UploadPurpose = "asset" | "preview";

type PresignedUrlInput = {
  bucket: string;
  key: string;
  method: "GET" | "PUT" | "DELETE";
  contentType?: string;
  expiresIn?: number;
};

const DEFAULT_SIGNED_URL_TTL_SECONDS = 15 * 60;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function encodeR2Path(value: string) {
  return value
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function encodeQueryValue(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function signingKey(secretAccessKey: string, date: string, region: string, service: string) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, date);
  const dateRegionKey = hmac(dateKey, region);
  const dateRegionServiceKey = hmac(dateRegionKey, service);

  return hmac(dateRegionServiceKey, "aws4_request");
}

function cleanEndpoint() {
  return (process.env.R2_ENDPOINT ?? `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`).replace(/\/+$/, "");
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_PRIVATE_BUCKET_NAME,
  );
}

export function requireR2Configured() {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 credentials are not configured");
  }
}

export function getR2Bucket(purpose: R2UploadPurpose) {
  return purpose === "preview"
    ? process.env.R2_PREVIEW_BUCKET_NAME ?? requiredEnv("R2_PRIVATE_BUCKET_NAME")
    : requiredEnv("R2_PRIVATE_BUCKET_NAME");
}

export function getR2Prefix(purpose: R2UploadPurpose) {
  const fallback = purpose === "preview" ? "imagiene/previews" : "imagiene/assets";
  return trimSlashes(
    purpose === "preview"
      ? process.env.R2_PREVIEW_PREFIX ?? fallback
      : process.env.R2_ASSET_PREFIX ?? fallback,
  );
}

export function createR2ObjectKey(purpose: R2UploadPurpose, fileName: string) {
  const safeName =
    fileName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "upload";
  const date = new Date().toISOString().slice(0, 10);

  return `${getR2Prefix(purpose)}/${date}/${randomUUID()}-${safeName}`;
}

export function getR2SignedUrl({
  bucket,
  key,
  method,
  contentType,
  expiresIn,
}: PresignedUrlInput) {
  requireR2Configured();

  const endpoint = new URL(cleanEndpoint());
  const region = process.env.R2_REGION ?? "auto";
  const service = "s3";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const normalizedKey = trimSlashes(key);
  const canonicalUri = `/${bucket}/${encodeR2Path(normalizedKey)}`;
  const headers: Record<string, string> = { host: endpoint.host };

  if (contentType) {
    headers["content-type"] = contentType;
  }

  const signedHeaders = Object.keys(headers).sort().join(";");
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(
      expiresIn ?? Number(process.env.R2_SIGNED_URL_TTL_SECONDS ?? DEFAULT_SIGNED_URL_TTL_SECONDS),
    ),
    "X-Amz-SignedHeaders": signedHeaders,
  });

  const canonicalQueryString = Array.from(query.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${encodeQueryValue(name)}=${encodeQueryValue(value)}`)
    .join("&");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((name) => `${name}:${headers[name].trim()}\n`)
    .join("");
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");
  const signature = createHmac("sha256", signingKey(secretAccessKey, dateStamp, region, service))
    .update(stringToSign, "utf8")
    .digest("hex");

  return `${endpoint.origin}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

export function getR2UploadUrl({
  key,
  purpose,
  contentType,
}: {
  key: string;
  purpose: R2UploadPurpose;
  contentType?: string;
}) {
  return getR2SignedUrl({
    bucket: getR2Bucket(purpose),
    key,
    method: "PUT",
    contentType,
  });
}

export async function deleteR2Object({
  key,
  purpose,
}: {
  key: string;
  purpose: R2UploadPurpose;
}) {
  if (!key || isExternalUrl(key)) {
    return;
  }

  const deleteUrl = getR2SignedUrl({
    bucket: getR2Bucket(purpose),
    key,
    method: "DELETE",
  });
  const response = await fetch(deleteUrl, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not delete ${purpose} object from R2`);
  }
}

export function getR2DownloadUrl(key: string) {
  return getR2SignedUrl({
    bucket: getR2Bucket("asset"),
    key,
    method: "GET",
  });
}

export function getR2PreviewUrl(key: string) {
  return getR2SignedUrl({
    bucket: getR2Bucket("preview"),
    key,
    method: "GET",
    expiresIn: 60,
  });
}

export function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
}
