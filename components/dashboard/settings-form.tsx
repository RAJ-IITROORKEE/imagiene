"use client";

import { Eye, ImagePlus, RefreshCw, UploadCloud, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState, useTransition } from "react";
import type { PlanType } from "@/lib/generated/prisma";
import { toast } from "sonner";

import { PlanBadge } from "@/components/dashboard/plan-badge";
import { ProfileAvatar } from "@/components/dashboard/profile-avatar";

type SettingsFormProps = {
  name: string;
  imageUrl: string;
  email: string;
  plan: PlanType;
};

type ProfileResponse = {
  data?: {
    name: string | null;
    imageUrl: string | null;
  };
  error?: {
    message?: string;
  };
};

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export function SettingsForm({ name, imageUrl, email, plan }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({ name, imageUrl });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function updatePreviewUrl(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setProfileImage(null);
      updatePreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for your profile picture");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      toast.error("Profile picture must be 5MB or smaller");
      event.target.value = "";
      return;
    }

    setProfileImage(file);
    updatePreviewUrl(file);
  }

  function clearSelectedImage() {
    setProfileImage(null);
    updatePreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const body = new FormData();
      body.set("name", formState.name);

      if (profileImage) {
        body.set("profileImage", profileImage);
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        body,
      });
      const payload = (await response.json()) as ProfileResponse;

      if (!response.ok) {
        toast.error(payload.error?.message ?? "Could not update profile");
        return;
      }

      setFormState({
        name: payload.data?.name ?? "",
        imageUrl: payload.data?.imageUrl ?? "",
      });
      clearSelectedImage();
      toast.success("Profile updated");
    });
  }

  const visibleImageUrl = previewUrl ?? formState.imageUrl;
  const hasPendingImage = Boolean(profileImage);
  const previewTitle = hasPendingImage ? "New profile photo preview" : "Current profile photo preview";

  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-b bg-muted/30 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Profile photo</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Your identity</h2>
            </div>
            <PlanBadge plan={plan} />
          </div>

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="relative">
              <ProfileAvatar name={formState.name} email={email} imageUrl={visibleImageUrl} className="h-36 w-36 text-3xl" />
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border bg-background text-primary shadow-sm transition hover:scale-105 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Preview profile picture"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 font-semibold">{formState.name || "Unnamed profile"}</p>
            <p className="mt-1 max-w-56 break-all text-sm text-muted-foreground">{email}</p>
            {hasPendingImage ? (
              <span className="mt-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">New photo ready to save</span>
            ) : (
              <span className="mt-4 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Current profile picture</span>
            )}
          </div>
        </aside>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-3xl border bg-background p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label htmlFor="profileImage" className="font-semibold">Replace profile picture</label>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Upload a square JPG, PNG, or WebP image. It will sync with your account profile.</p>
              </div>
              <label htmlFor="profileImage" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                <ImagePlus className="h-4 w-4" />
                Upload photo
              </label>
            </div>
            <input ref={fileInputRef} id="profileImage" type="file" accept="image/*" onChange={onImageChange} className="sr-only" />
            {profileImage ? (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profileImage.name}</span>
                  <span className="text-muted-foreground">{Math.ceil(profileImage.size / 1024)} KB</span>
                </div>
                <button type="button" onClick={clearSelectedImage} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                  <X className="h-4 w-4" />
                  Remove selection
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="email" className="text-sm font-semibold">Email</label>
              <input
                id="email"
                value={email}
                disabled
                className="mt-2 h-12 w-full rounded-2xl border bg-muted px-4 text-sm text-muted-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">Email changes are managed by your authentication account.</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="name" className="text-sm font-semibold">Display name</label>
              <input
                id="name"
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                placeholder="Dr. Ada Researcher"
                className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">This name appears in your dashboard header and account profile card.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Current access level: <span className="font-semibold text-foreground">{plan}</span></p>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isPending ? "Saving profile..." : hasPendingImage ? "Save and upload photo" : "Save profile"}
            </button>
          </div>
        </div>
      </div>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-photo-preview-title"
            className="w-full max-w-md overflow-hidden rounded-[2rem] border bg-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Profile preview</p>
                <h3 id="profile-photo-preview-title" className="mt-1 text-lg font-semibold">{previewTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close profile picture preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6 text-center">
              <div className="mx-auto h-64 w-64 max-w-full overflow-hidden rounded-[2rem] border bg-muted shadow-inner">
                <ProfileAvatar name={formState.name} email={email} imageUrl={visibleImageUrl} className="h-full w-full rounded-[2rem] text-5xl" />
              </div>
              <div>
                <p className="font-semibold">{formState.name || "Unnamed profile"}</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{email}</p>
              </div>
              {hasPendingImage ? (
                <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">This new photo is only a preview until you save the profile.</p>
              ) : (
                <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">This is the profile picture currently shown on your account.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
