/**
 * Pre-migration safety check (runs in `vercel-build` before `prisma migrate
 * deploy`). Refuses to continue if the target database's `public` schema has
 * tables this app didn't create, so a mis-synced connection string can never
 * migrate into another application's database.
 */
import "dotenv/config";
import pg from "pg";
import { foreignTables, migrationDatabaseUrl, withLibpqSslCompat } from "../src/lib/db-url";

async function main() {
  const url = migrationDatabaseUrl();
  if (!url) throw new Error("No database URL configured (connect Supabase or set DATABASE_URL).");

  const client = new pg.Client({ connectionString: withLibpqSslCompat(url) });
  await client.connect();
  try {
    const { rows } = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    );
    const foreign = foreignTables(rows.map((r) => r.tablename));
    if (foreign.length > 0) {
      console.error(
        `Refusing to migrate: this database's public schema has ${foreign.length} table(s) that don't ` +
          `belong to this app (e.g. ${foreign.slice(0, 5).join(", ")}). Point the project at its own database.`,
      );
      process.exit(1);
    }
    console.log(`Database check passed (${rows.length} app table(s) present).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Database check failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
