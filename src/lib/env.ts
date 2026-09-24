import { z } from "zod";

const schema = z.object({
  /** Public base URL used in emailed links, e.g. https://signups.example.org */
  APP_URL: z.string().url().optional(),
  /** Comma-separated emails that are always admins (bootstrap). */
  ADMIN_EMAILS: z.string().default(""),
  RESEND_API_KEY: z.string().optional(),
  /** e.g. "Rancho Solano PTO <signups@your-domain.org>" (domain verified in Resend). */
  EMAIL_FROM: z.string().default("Rancho Solano PTO <onboarding@resend.dev>"),
  /** Secret salt for hashing IPs in rate-limit keys. */
  RATE_LIMIT_SALT: z.string().default("dev-only-salt"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
  VERCEL_URL: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

export function env(): Env {
  return schema.parse(process.env);
}

/** True only on the Vercel production deployment (not previews, not local). */
export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function adminEmails(): string[] {
  return env()
    .ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function appUrl(): string {
  const e = env();
  if (e.APP_URL) return e.APP_URL.replace(/\/$/, "");
  if (e.VERCEL_URL) return `https://${e.VERCEL_URL}`;
  return "http://localhost:3000";
}
