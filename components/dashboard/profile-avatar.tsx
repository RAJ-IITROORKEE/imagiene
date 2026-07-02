import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

  return initials || "U";
}

type ProfileAvatarProps = {
  name: string;
  email: string;
  imageUrl?: string | null;
  className?: string;
};

export function ProfileAvatar({ name, email, imageUrl, className }: ProfileAvatarProps) {
  const label = name || email || "User";

  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-foreground shadow-sm", className)}>
      {imageUrl ? (
        <div
          aria-label={`${label} profile picture`}
          className="h-full w-full bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-muted text-lg font-bold">
          {label ? getInitials(name, email) : <UserRound className="h-6 w-6" />}
        </div>
      )}
    </div>
  );
}
