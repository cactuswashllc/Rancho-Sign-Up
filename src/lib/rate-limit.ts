import { createHash } from "node:crypto";
import { db } from "./db";
import { env } from "./env";

/** Hash an IP (or other identifier) so raw IPs are never stored. */
export function hashIdentifier(id: string): string {
  return createHash("sha256").update(`${env().RATE_LIMIT_SALT}:${id}`).digest("hex").slice(0, 32);
}

/**
 * Sliding-window limiter backed by Postgres (no extra vendor needed).
 * Returns true if the action is allowed (and records the hit).
 */
export async function rateLimit(
  action: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const key = `${action}:${hashIdentifier(identifier)}`;
  const since = new Date(Date.now() - windowMs);
  const recent = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (recent >= limit) return false;
  await db.rateLimitHit.create({ data: { key } });
  // Opportunistic cleanup of this key's expired hits keeps the table small.
  await db.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: since } } });
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
