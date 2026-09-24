"use client";

import { useRef, useState, useTransition } from "react";
import { ThemeBanner } from "@/components/ThemeBanner";
import type { FormState } from "@/app/organizer/(app)/actions";
import type { Theme } from "@/lib/themes";
import { IMAGE_TYPES, uploadEventImage } from "./upload";

export function HeaderImageManager({
  eventId,
  theme,
  title,
  headerText,
  imageUrl,
  uploadsEnabled,
  setAction,
  removeAction,
}: {
  eventId: string;
  theme: Theme;
  title: string;
  headerText: string | null;
  imageUrl: string | null;
  uploadsEnabled: boolean;
  setAction: (url: string) => Promise<FormState>;
  removeAction: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadEventImage(eventId, file);
      const res = await setAction(url);
      if (res.error) setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-lg" aria-label="Header preview">
        <ThemeBanner theme={theme} imageUrl={imageUrl} compact>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: theme.accent }}>
            {theme.name}
          </p>
          <p className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">{title}</p>
          <p className="mt-1 font-serif italic text-navy-100">{headerText ?? theme.tagline}</p>
        </ThemeBanner>
      </div>

      {uploadsEnabled ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            className="sr-only"
            id="header-image-input"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <label htmlFor="header-image-input" className="btn btn-secondary cursor-pointer">
            {uploading ? "Uploading…" : imageUrl ? "Replace header image" : "Upload header image"}
          </label>
          {imageUrl && (
            <button
              type="button"
              className="btn btn-ghost text-red-800"
              disabled={pending || uploading}
              onClick={() => startTransition(() => removeAction())}
            >
              Use theme pattern instead
            </button>
          )}
          <p className="basis-full text-xs text-navy-500">
            A wide landscape photo works best (at least 1600 × 500). It&apos;s tinted navy so the title stays
            readable. JPG, PNG, WebP, GIF, or AVIF · up to 8 MB.
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-navy-50 p-3 text-sm text-navy-700">
          Image uploads are turned off because Vercel Blob storage isn&apos;t connected
          (BLOB_READ_WRITE_TOKEN).
        </p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
