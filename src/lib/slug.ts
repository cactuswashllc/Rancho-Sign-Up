import { randomBytes } from "node:crypto";

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return base || "event";
}

/** Slug with a short random suffix so share links are hard to guess and never collide. */
export function eventSlug(title: string): string {
  return `${slugify(title)}-${randomBytes(3).toString("hex")}`;
}
