import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import pg from "pg";
import { E2E_SESSION_TOKEN } from "./constants";

/** Fresh schema + demo data + a ready-made organizer session. Runs before the e2e server starts. */
async function main() {
  const url = process.env.DATABASE_URL!;
  // Safety: this wipes the schema, so only ever run it against a throwaway e2e database.
  if (!new URL(url).pathname.endsWith("_e2e"))
    throw new Error("Refusing to reset a database not named *_e2e");

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");

  const env = { ...process.env, DATABASE_URL_UNPOOLED: url };
  execSync("pnpm exec prisma migrate deploy", { env, stdio: "inherit" });
  execSync("pnpm exec tsx prisma/seed.ts", { env, stdio: "inherit" });

  const { rows } = await client.query(`SELECT id FROM "Organizer" WHERE email = 'admin@example.com'`);
  await client.query(
    `INSERT INTO "Session" (id, "tokenHash", "organizerId", "expiresAt") VALUES ($1, $2, $3, now() + interval '1 day')`,
    ["e2e-session", createHash("sha256").update(E2E_SESSION_TOKEN).digest("hex"), rows[0].id],
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
