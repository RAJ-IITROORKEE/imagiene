import { createHash, createHmac, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../lib/generated/prisma/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const isWrite = process.argv.includes("--write");

loadEnv(path.join(root, ".env"));
loadEnv(path.join(root, ".env.local"));

const prisma = new PrismaClient();

function loadEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

function encodeR2Path(value) {
  return value
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function encodeQueryValue(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function hmac(key, value) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function signingKey(secretAccessKey, date, region, service) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, date);
  const dateRegionKey = hmac(dateKey, region);
  const dateRegionServiceKey = hmac(dateRegionKey, service);

  return hmac(dateRegionServiceKey, "aws4_request");
}

function cleanEndpoint() {
  return (process.env.R2_ENDPOINT ?? `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`).replace(/\/+$/, "");
}

function getSignedUrl({ bucket, key, method, contentType }) {
  const endpoint = new URL(cleanEndpoint());
  const region = process.env.R2_REGION ?? "auto";
  const service = "s3";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const canonicalUri = `/${bucket}/${encodeR2Path(trimSlashes(key))}`;
  const headers = { host: endpoint.host };

  if (contentType) {
    headers["content-type"] = contentType;
  }

  const signedHeaders = Object.keys(headers).sort().join(";");
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(process.env.R2_SIGNED_URL_TTL_SECONDS ?? 900),
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
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(secretAccessKey, dateStamp, region, service))
    .update(stringToSign, "utf8")
    .digest("hex");

  return `${endpoint.origin}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

function getPreviewBucket() {
  return process.env.R2_PREVIEW_BUCKET_NAME || requiredEnv("R2_PRIVATE_BUCKET_NAME");
}

function getPreviewPrefix() {
  return trimSlashes(process.env.R2_PREVIEW_PREFIX ?? "imagiene/previews");
}

function safeName(asset, url) {
  const pathname = new URL(url).pathname;
  const baseName = path.basename(pathname) || `${asset.slug || asset.id}.preview`;

  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "preview";
}

function createPreviewKey(asset, url) {
  const date = new Date().toISOString().slice(0, 10);

  return `${getPreviewPrefix()}/${date}/${randomUUID()}-${safeName(asset, url)}`;
}

async function migrateAsset(asset) {
  const source = await fetch(asset.previewUrl, { cache: "no-store" });

  if (!source.ok) {
    throw new Error(`source returned ${source.status}`);
  }

  const contentType = source.headers.get("content-type") || "application/octet-stream";
  const body = Buffer.from(await source.arrayBuffer());
  const key = createPreviewKey(asset, asset.previewUrl);
  const uploadUrl = getSignedUrl({
    bucket: getPreviewBucket(),
    key,
    method: "PUT",
    contentType,
  });
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });

  if (!uploaded.ok) {
    throw new Error(`R2 upload returned ${uploaded.status}`);
  }

  await prisma.asset.update({
    where: { id: asset.id },
    data: { previewUrl: key },
  });

  return key;
}

async function main() {
  const assets = await prisma.asset.findMany({
    where: {
      previewUrl: { startsWith: "http" },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      previewUrl: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`${isWrite ? "WRITE" : "DRY-RUN"}: ${assets.length} asset preview URL(s) need migration.`);

  if (!isWrite) {
    for (const asset of assets) {
      console.log(`- ${asset.id} ${JSON.stringify(asset.title)} host=${new URL(asset.previewUrl).host}`);
    }

    console.log("Run `node scripts/migrate-public-previews-to-private-r2.mjs --write` to copy files and update DB.");
    return;
  }

  let migrated = 0;

  for (const asset of assets) {
    try {
      const key = await migrateAsset(asset);
      migrated += 1;
      console.log(`migrated ${asset.id} -> ${key}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`failed ${asset.id}: ${message}`);
    }
  }

  console.log(`Done. Migrated ${migrated}/${assets.length} preview(s).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
