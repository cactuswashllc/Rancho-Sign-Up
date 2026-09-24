import { createHash, randomBytes } from "node:crypto";

/** URL-safe random token with 256 bits of entropy. */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
