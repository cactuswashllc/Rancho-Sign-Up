/**
 * Connection-string resolution. On Vercel the Supabase integration provides
 * POSTGRES_PRISMA_URL (pooled, for the app) and POSTGRES_URL_NON_POOLING
 * (direct/session, for migrations). DATABASE_URL covers local dev and CI.
 */
type Env = Record<string, string | undefined>;

export function runtimeDatabaseUrl(env: Env = process.env): string {
  const url = env.POSTGRES_PRISMA_URL || env.DATABASE_URL;
  if (!url)
    throw new Error("No database URL: set DATABASE_URL (local) or connect Supabase (POSTGRES_PRISMA_URL).");
  return url;
}

export function migrationDatabaseUrl(env: Env = process.env): string | undefined {
  return env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL;
}

/**
 * node-postgres treats `sslmode=require` as verify-full, which fails against
 * Supabase's certificate chain on Vercel. `uselibpqcompat=true` restores libpq
 * semantics (encrypted, not verified). Local hosts run without SSL.
 */
export function withLibpqSslCompat(connectionString: string): string {
  const url = new URL(connectionString);
  if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return connectionString;
  if (!url.searchParams.has("uselibpqcompat")) url.searchParams.set("uselibpqcompat", "true");
  if (!url.searchParams.has("sslmode")) url.searchParams.set("sslmode", "require");
  return url.toString();
}

/** Tables this app owns in `public` (plus Prisma's migration ledger). */
export const OWN_TABLES = [
  "_prisma_migrations",
  "Organizer",
  "MagicLinkToken",
  "Session",
  "Event",
  "EventImage",
  "Item",
  "Signup",
  "SignupItem",
  "RateLimitHit",
] as const;

/** Tables in `public` that don't belong to this app (non-empty ⇒ wrong database). */
export function foreignTables(publicTables: string[]): string[] {
  const own = new Set<string>(OWN_TABLES);
  return publicTables.filter((t) => !own.has(t)).sort();
}
