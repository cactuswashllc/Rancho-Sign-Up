import { describe, expect, it } from "vitest";
import { isOurBlobUrl } from "@/lib/blob-url";

describe("isOurBlobUrl", () => {
  it("accepts Vercel Blob public URLs", () => {
    expect(isOurBlobUrl("https://abc123.public.blob.vercel-storage.com/events/x/header.jpg")).toBe(true);
  });

  it.each([
    "http://abc123.public.blob.vercel-storage.com/a.jpg",
    "https://evil.example/a.jpg",
    "https://public.blob.vercel-storage.com.evil.example/a.jpg",
    "javascript:alert(1)",
    "not a url",
  ])("rejects %s", (url) => {
    expect(isOurBlobUrl(url)).toBe(false);
  });
});
