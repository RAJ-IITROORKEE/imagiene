import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminUserAvatarProps = {
  name: string | null;
  email: string;
  imageUrl?: string | null;
  className?: string;
};

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

  return initials || "U";
}

export function AdminUserAvatar({ name, email, imageUrl, className }: AdminUserAvatarProps) {
  const label = `${name ?? email} profile picture`;

  return (
    <div className={cn("relative flex size-12 shrink-0 overflow-hidden rounded-2xl border bg-muted", className)}>
      {imageUrl ? (
        <div
          role="img"
          aria-label={label}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-muted text-sm font-semibold text-foreground">
          {getInitials(name, email) || <UserRound className="size-5" />}
        </div>
      )}
    </div>
  );
}
