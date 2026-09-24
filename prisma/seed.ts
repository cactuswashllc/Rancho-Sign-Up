/**
 * Local/demo data only — production is provisioned by `prisma migrate deploy`
 * and organizers create real events in the app. Synthetic names only.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

function nextDate(month: number, day: number) {
  const now = new Date();
  let year = now.getUTCFullYear();
  if (new Date(Date.UTC(year, month - 1, day)) < now) year += 1;
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  const admin = await db.organizer.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Demo Admin", role: "ADMIN" },
  });

  const demos = [
    {
      slug: "demo-halloween-party",
      title: "3rd Grade Halloween Party",
      eventDate: nextDate(10, 30),
      location: "Room 12",
      themeKey: "halloween",
      status: "OPEN" as const,
      description:
        "Our class Halloween party is Friday afternoon! Please drop items at the front office by 9am.\n\nCostumes welcome — no masks or props, please.",
      amazonListUrl: "https://www.amazon.com/hz/wishlist/ls/DEMO123",
      items: [
        ["Juice boxes (10-pack)", 4, "Apple or fruit punch"],
        ["Paper plates (50 ct)", 2, ""],
        ["Napkins", 2, "Orange or black if possible"],
        ["Pumpkin cookies (dozen)", 3, "Nut-free please"],
        ["Craft kit — foam pumpkins", 1, ""],
      ] as const,
    },
    {
      slug: "demo-thanksgiving-feast",
      title: "Kindergarten Thanksgiving Feast",
      eventDate: nextDate(11, 24),
      location: "Main Hall",
      themeKey: "thanksgiving",
      status: "OPEN" as const,
      description: "Join us for our annual kindergarten feast.",
      amazonListUrl: null,
      items: [
        ["Dinner rolls (dozen)", 4, ""],
        ["Fruit tray", 2, ""],
      ] as const,
    },
  ];

  for (const d of demos) {
    const { items, ...data } = d;
    const existing = await db.event.findUnique({ where: { slug: d.slug } });
    if (existing) continue;
    await db.event.create({
      data: {
        ...data,
        createdById: admin.id,
        items: {
          create: items.map(([name, quantityNeeded, notes], sortOrder) => ({
            name,
            quantityNeeded,
            notes,
            sortOrder,
          })),
        },
      },
    });
  }
  console.log("Seeded demo data.");
}

main().finally(() => db.$disconnect());
