import { describe, expect, it } from "vitest";
import { normalizeAmazonUrl } from "@/lib/amazon";

describe("normalizeAmazonUrl", () => {
  it.each([
    "https://www.amazon.com/hz/wishlist/ls/ABC123",
    "https://amazon.com/dp/B000123",
    "https://a.co/d/abc",
    "https://amzn.to/3xyz",
    "https://smile.amazon.com/registry/abc",
  ])("accepts %s", (url) => {
    expect(normalizeAmazonUrl(url)).toBe(new URL(url).toString());
  });

  it("upgrades http to https", () => {
    expect(normalizeAmazonUrl("http://www.amazon.com/dp/B1")).toBe("https://www.amazon.com/dp/B1");
  });

  it.each([
    "https://amazon.com.evil.example/dp/1",
    "https://evilamazon.com/",
    "https://www.amazon.co.uk/dp/1",
    "javascript:alert(1)",
    "https://user:pass@www.amazon.com/",
    "ftp://amazon.com/",
    "not a url",
    "",
  ])("rejects %s", (url) => {
    expect(normalizeAmazonUrl(url)).toBeNull();
  });
});
