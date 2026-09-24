import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { OWN_TABLES } from "@/lib/db-url";

afterAll(() => db.$disconnect());

describe("row level security", () => {
  it("is enabled on every app table", async () => {
    const rows = await db.$queryRaw<{ relname: string; relrowsecurity: boolean }[]>`
      SELECT c.relname, c.relrowsecurity FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname <> '_prisma_migrations'`;
    expect(rows.map((r) => r.relname).sort()).toEqual(
      OWN_TABLES.filter((t) => t !== "_prisma_migrations").sort(),
    );
    expect(rows.filter((r) => !r.relrowsecurity)).toEqual([]);
  });
});
