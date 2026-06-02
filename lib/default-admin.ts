import type { UserRole } from "@prisma/client";

const FALLBACK_ADMIN_EMAILS = ["raj_r@mt.iitr.ac.in"];

export function getDefaultAdminEmails(): string[] {
  const configuredEmails = process.env.DEFAULT_ADMIN_EMAILS?.split(",") ?? [];

  return [...FALLBACK_ADMIN_EMAILS, ...configuredEmails]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isDefaultAdminEmail(email: string): boolean {
  return getDefaultAdminEmails().includes(email.trim().toLowerCase());
}

export function getDefaultRoleForEmail(email: string): UserRole {
  return isDefaultAdminEmail(email) ? "ADMIN" : "USER";
}
