import { describe, expect, it } from "vitest";
import {
  foreignTables,
  migrationDatabaseUrl,
  OWN_TABLES,
  runtimeDatabaseUrl,
  withLibpqSslCompat,
} from "@/lib/db-url";

describe("database URL resolution", () => {
  it("prefers the Supabase pooled URL at runtime", () => {
    expect(runtimeDatabaseUrl({ POSTGRES_PRISMA_URL: "pooled", DATABASE_URL: "local" })).toBe("pooled");
    expect(runtimeDatabaseUrl({ DATABASE_URL: "local" })).toBe("local");
    expect(() => runtimeDatabaseUrl({})).toThrow(/No database URL/);
  });

  it("uses a direct connection for migrations", () => {
    expect(migrationDatabaseUrl({ POSTGRES_URL_NON_POOLING: "direct", DATABASE_URL: "local" })).toBe(
      "direct",
    );
    expect(migrationDatabaseUrl({ DATABASE_URL: "local" })).toBe("local");
  });

  it("adds libpq SSL semantics for remote hosts only", () => {
    const remote = new URL(
      withLibpqSslCompat("postgresql://u:p@db.example.supabase.co:6543/postgres?pgbouncer=true"),
    );
    expect(remote.searchParams.get("uselibpqcompat")).toBe("true");
    expect(remote.searchParams.get("sslmode")).toBe("require");
    expect(remote.searchParams.get("pgbouncer")).toBe("true");
    expect(withLibpqSslCompat("postgresql://u:p@localhost:5432/x")).toBe("postgresql://u:p@localhost:5432/x");
  });
});

describe("foreignTables", () => {
  it("accepts an empty or own database", () => {
    expect(foreignTables([])).toEqual([]);
    expect(foreignTables([...OWN_TABLES])).toEqual([]);
  });

  it("flags another app's tables", () => {
    expect(foreignTables(["Event", "Organization", "Membership"])).toEqual(["Membership", "Organization"]);
  });
});
