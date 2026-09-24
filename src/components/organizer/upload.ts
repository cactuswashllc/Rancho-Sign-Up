"use client";

import { upload } from "@vercel/blob/client";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Validate and upload one image straight from the browser to Vercel Blob. Throws a user-facing message. */
export async function uploadEventImage(eventId: string, file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type))
    throw new Error(`${file.name}: please choose a JPG, PNG, WebP, GIF, or AVIF image.`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} is larger than 8 MB.`);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  try {
    const blob = await upload(`events/${eventId}/${safeName}`, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      contentType: file.type,
    });
    return blob.url;
  } catch {
    throw new Error(`Couldn't upload ${file.name}. Please try again.`);
  }
}
