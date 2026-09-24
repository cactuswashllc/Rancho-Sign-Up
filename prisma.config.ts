import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 does not auto-load .env files.
config({ path: [".env.local", ".env"], quiet: true });

// Migrations need a direct (non-pooled) connection. The Neon ↔ Vercel
// integration provides DATABASE_URL_UNPOOLED; fall back to DATABASE_URL
// locally. `prisma generate` never connects, so a placeholder keeps
// `pnpm install` working when neither is set.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      "postgresql://placeholder:5432/placeholder",
  },
});
