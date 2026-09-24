const AMAZON_HOSTS = [/^(www\.|smile\.)?amazon\.com$/, /^a\.co$/, /^amzn\.to$/, /^amzn\.com$/];

/**
 * Returns the normalized URL if it is an https Amazon link, otherwise null.
 * Only Amazon links are accepted so the site can't be used to point parents
 * at arbitrary (possibly malicious) destinations.
 */
export function normalizeAmazonUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (!AMAZON_HOSTS.some((re) => re.test(host))) return null;
  return url.toString();
}
