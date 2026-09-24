import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 does not auto-load .env files.
config({ path: [".env.local", ".env"], quiet: true });

// Migrations need a direct (non-pooled) connection: POSTGRES_URL_NON_POOLING
// from the Supabase integration on Vercel, DATABASE_URL locally/CI. Keep in
// sync with migrationDatabaseUrl() in src/lib/db-url.ts. `prisma generate`
// never connects, so a placeholder keeps `pnpm install` working.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL ||
      "postgresql://placeholder:5432/placeholder",
  },
});
