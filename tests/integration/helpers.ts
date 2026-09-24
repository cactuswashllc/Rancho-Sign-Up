import { db } from "@/lib/db";

export async function resetDb() {
  await db.$executeRawUnsafe(
    `TRUNCATE "SignupItem", "Signup", "Item", "EventImage", "Event", "Session", "MagicLinkToken", "Organizer", "RateLimitHit" CASCADE`,
  );
}

export async function makeEvent(
  opts: { status?: "DRAFT" | "OPEN" | "CLOSED"; items?: [string, number][] } = {},
) {
  const event = await db.event.create({
    data: {
      slug: `test-${Math.random().toString(36).slice(2, 8)}`,
      title: "Test Party",
      eventDate: new Date("2099-10-31T00:00:00Z"),
      status: opts.status ?? "OPEN",
    },
  });
  const items = [];
  for (const [i, [name, qty]] of (opts.items ?? [["Juice boxes", 6]]).entries())
    items.push(
      await db.item.create({ data: { eventId: event.id, name, quantityNeeded: qty, sortOrder: i } }),
    );
  return { event, items };
}

export const parent = (n = 1) => ({
  parentName: `Parent ${n}`,
  parentEmail: `parent${n}@example.com`,
  studentName: `Student ${n}`,
  grade: "3rd" as const,
});
