"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { FormState } from "@/app/organizer/(app)/actions";
import { IMAGE_TYPES, uploadEventImage } from "./upload";

export function ImageManager({
  eventId,
  images,
  uploadsEnabled,
  addAction,
  removeAction,
  coverAction,
}: {
  eventId: string;
  images: { id: string; url: string; alt: string }[];
  uploadsEnabled: boolean;
  addAction: (url: string, alt: string) => Promise<FormState>;
  removeAction: (imageId: string) => Promise<void>;
  coverAction: (imageId: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files);
    for (const [i, file] of list.entries()) {
      try {
        setProgress(`Uploading ${i + 1} of ${list.length}…`);
        const url = await uploadEventImage(eventId, file);
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const res = await addAction(url, alt);
        if (res.error) setError(res.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mt-4">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-lg border border-navy-100 bg-white">
              <div className="relative aspect-[4/3] bg-navy-50">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded bg-navy-900 px-2 py-0.5 text-xs font-semibold text-white">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex gap-1 p-2">
                {i > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost min-h-9 flex-1 px-2 text-xs"
                    disabled={pending}
                    onClick={() => startTransition(() => coverAction(img.id))}
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost min-h-9 flex-1 px-2 text-xs text-red-800"
                  disabled={pending}
                  onClick={() => startTransition(() => removeAction(img.id))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {uploadsEnabled ? (
        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            id="photo-input"
            onChange={(e) => onFiles(e.target.files)}
          />
          <label htmlFor="photo-input" className="btn btn-secondary cursor-pointer">
            {progress ?? "Add photos"}
          </label>
          <p className="mt-2 text-xs text-navy-500">JPG, PNG, WebP, GIF, or AVIF · up to 8 MB each.</p>
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-navy-50 p-3 text-sm text-navy-700">
          Photo uploads are turned off because Vercel Blob storage isn&apos;t connected
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
