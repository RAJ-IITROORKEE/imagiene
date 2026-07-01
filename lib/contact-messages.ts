import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

export type ContactStatus = "NEW" | "READ" | "RESOLVED";

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  userId: string | null;
  readAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type MongoValue = string | number | boolean | Date | null | MongoDocument | MongoValue[];
type MongoDocument = { [key: string]: MongoValue };

const collection = "ContactMessage";

function objectId(id: string) {
  return { $oid: id };
}

function createObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  return `${timestamp}${randomBytes(8).toString("hex")}`;
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    return new Date(value);
  }

  if (typeof value === "object" && "$date" in value) {
    const dateValue = (value as { $date: string | number | Date }).$date;

    return new Date(dateValue);
  }

  return null;
}

function toId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value && "$oid" in value) {
    return String((value as { $oid: string }).$oid);
  }

  return String(value ?? "");
}

function normalizeContactMessage(document: Record<string, unknown>): ContactMessageRecord {
  return {
    id: toId(document._id),
    name: String(document.name ?? ""),
    email: String(document.email ?? ""),
    subject: String(document.subject ?? ""),
    message: String(document.message ?? ""),
    status: (document.status === "READ" || document.status === "RESOLVED" ? document.status : "NEW") as ContactStatus,
    userId: document.userId ? toId(document.userId) : null,
    readAt: toDate(document.readAt),
    resolvedAt: toDate(document.resolvedAt),
    createdAt: toDate(document.createdAt) ?? new Date(0),
    updatedAt: toDate(document.updatedAt) ?? new Date(0),
  };
}

function searchFilter({ q, status }: { q?: string; status?: string }): MongoDocument {
  const filter: MongoDocument = {};

  if (status === "NEW" || status === "READ" || status === "RESOLVED") {
    filter.status = status;
  }

  if (q) {
    const pattern = { $regex: q, $options: "i" };
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { subject: pattern },
      { message: pattern },
    ];
  }

  return filter;
}

async function rawCommand<T>(command: MongoDocument): Promise<T> {
  return prisma.$runCommandRaw(command) as Promise<T>;
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string | null;
}) {
  const now = new Date();
  const id = createObjectId();
  const document: MongoDocument = {
    _id: objectId(id),
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    status: "NEW",
    userId: input.userId ? objectId(input.userId) : null,
    readAt: null,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await rawCommand({ insert: collection, documents: [document] });

  return { id, status: "NEW" as ContactStatus, createdAt: now };
}

export async function listContactMessages({
  q,
  status,
  page,
  pageSize,
}: {
  q?: string;
  status?: string;
  page: number;
  pageSize: number;
}) {
  const filter = searchFilter({ q, status });
  const skip = (page - 1) * pageSize;
  const [countResult, findResult] = await Promise.all([
    rawCommand<{ n: number }>({ count: collection, query: filter }),
    rawCommand<{ cursor?: { firstBatch?: Record<string, unknown>[] } }>({
      find: collection,
      filter,
      sort: { createdAt: -1 },
      skip,
      limit: pageSize,
    }),
  ]);

  return {
    total: countResult.n ?? 0,
    messages: (findResult.cursor?.firstBatch ?? []).map(normalizeContactMessage),
  };
}

export async function countContactMessages(status?: ContactStatus) {
  const result = await rawCommand<{ n: number }>({
    count: collection,
    query: status ? { status } : {},
  });

  return result.n ?? 0;
}

export async function getRecentContactMessages(take: number) {
  const result = await rawCommand<{ cursor?: { firstBatch?: Record<string, unknown>[] } }>({
    find: collection,
    filter: {},
    sort: { createdAt: -1 },
    limit: take,
  });

  return (result.cursor?.firstBatch ?? []).map(normalizeContactMessage);
}

export async function updateContactMessageStatus(id: string, status: ContactStatus) {
  const now = new Date();
  await rawCommand({
    update: collection,
    updates: [
      {
        q: { _id: objectId(id) },
        u: {
          $set: {
            status,
            readAt: status === "READ" || status === "RESOLVED" ? now : null,
            resolvedAt: status === "RESOLVED" ? now : null,
            updatedAt: now,
          },
        },
      },
    ],
  });

  const result = await rawCommand<{ cursor?: { firstBatch?: Record<string, unknown>[] } }>({
    find: collection,
    filter: { _id: objectId(id) },
    limit: 1,
  });
  const message = result.cursor?.firstBatch?.[0];

  if (!message) {
    throw new Error("Contact message not found");
  }

  return normalizeContactMessage(message);
}

export async function deleteContactMessage(id: string) {
  const result = await rawCommand<{ cursor?: { firstBatch?: Record<string, unknown>[] } }>({
    find: collection,
    filter: { _id: objectId(id) },
    limit: 1,
  });
  const message = result.cursor?.firstBatch?.[0];

  await rawCommand({ delete: collection, deletes: [{ q: { _id: objectId(id) }, limit: 1 }] });

  return message ? normalizeContactMessage(message) : { id };
}
