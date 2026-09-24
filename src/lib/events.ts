import { db } from "./db";
import { eventSlug } from "./slug";
import { todayInSchoolTz } from "./dates";
import type { EventInput, ItemInput } from "./validation";

export type Result = { ok: true } | { ok: false; error: string };

/** Open, upcoming events for the public home page. */
export function listOpenEvents() {
  return db.event.findMany({
    where: { status: "OPEN", eventDate: { gte: todayInSchoolTz() } },
    orderBy: { eventDate: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

export function getPublicEvent(slug: string) {
  return db.event.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function listEventsForOrganizer() {
  const events = await db.event.findMany({
    orderBy: [{ eventDate: "desc" }],
    include: {
      _count: { select: { signups: true } },
      items: { select: { quantityNeeded: true, lines: { select: { quantity: true } } } },
    },
  });
  return events.map(({ items, ...e }) => ({
    ...e,
    needed: items.reduce((n, i) => n + i.quantityNeeded, 0),
    claimed: items.reduce((n, i) => n + i.lines.reduce((m, l) => m + l.quantity, 0), 0),
  }));
}

export function getEventForOrganizer(id: string) {
  return db.event.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      signups: {
        orderBy: { createdAt: "asc" },
        include: { items: { include: { item: { select: { name: true } } } } },
      },
    },
  });
}

export async function createEvent(input: EventInput, organizerId: string) {
  return db.event.create({
    data: { ...input, slug: eventSlug(input.title), createdById: organizerId },
  });
}

export async function updateEvent(id: string, input: EventInput) {
  return db.event.update({ where: { id }, data: input });
}

export async function deleteEvent(id: string) {
  const images = await db.eventImage.findMany({ where: { eventId: id }, select: { url: true } });
  // Sign-ups first: SignupItem → Item is NO ACTION so a claimed item can
  // never be deleted on its own, which also blocks a one-shot cascade.
  await db.$transaction([
    db.signup.deleteMany({ where: { eventId: id } }),
    db.event.delete({ where: { id } }),
  ]);
  return images.map((i) => i.url);
}

export async function addItem(eventId: string, input: ItemInput) {
  const last = await db.item.aggregate({ where: { eventId }, _max: { sortOrder: true } });
  return db.item.create({
    data: { ...input, eventId, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
}

/** Update an item; refuses to drop quantity below what parents already claimed. */
export async function updateItem(eventId: string, itemId: string, input: ItemInput): Promise<Result> {
  return db.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Item" WHERE id = ${itemId} AND "eventId" = ${eventId} FOR UPDATE`;
    if (locked.length === 0) return { ok: false, error: "Item not found." };
    const sum = await tx.signupItem.aggregate({ where: { itemId }, _sum: { quantity: true } });
    const claimed = sum._sum.quantity ?? 0;
    if (input.quantityNeeded < claimed)
      return {
        ok: false,
        error: `Parents have already claimed ${claimed}. Remove sign-ups first to go lower.`,
      };
    await tx.item.update({ where: { id: itemId }, data: input });
    return { ok: true };
  });
}

export async function deleteItem(eventId: string, itemId: string): Promise<Result> {
  return db.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Item" WHERE id = ${itemId} AND "eventId" = ${eventId} FOR UPDATE`;
    if (locked.length === 0) return { ok: false, error: "Item not found." };
    const claims = await tx.signupItem.count({ where: { itemId } });
    if (claims > 0)
      return { ok: false, error: "Parents have signed up for this item. Remove their sign-ups first." };
    await tx.item.delete({ where: { id: itemId } });
    return { ok: true };
  });
}

export async function moveItem(eventId: string, itemId: string, direction: "up" | "down") {
  const items = await db.item.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const i = items.findIndex((x) => x.id === itemId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= items.length) return;
  [items[i], items[j]] = [items[j]!, items[i]!];
  await db.$transaction(
    items.map((x, idx) => db.item.update({ where: { id: x.id }, data: { sortOrder: idx } })),
  );
}

export async function addImage(eventId: string, url: string, alt: string) {
  const last = await db.eventImage.aggregate({ where: { eventId }, _max: { sortOrder: true } });
  return db.eventImage.create({
    data: { eventId, url, alt, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
}

/** Returns the removed image URL (so the caller can delete the blob), or null. */
export async function removeImage(eventId: string, imageId: string) {
  const img = await db.eventImage.findFirst({ where: { id: imageId, eventId } });
  if (!img) return null;
  await db.eventImage.delete({ where: { id: img.id } });
  return img.url;
}

export async function makeCoverImage(eventId: string, imageId: string) {
  const images = await db.eventImage.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  const ordered = [...images.filter((i) => i.id === imageId), ...images.filter((i) => i.id !== imageId)];
  await db.$transaction(
    ordered.map((x, idx) => db.eventImage.update({ where: { id: x.id }, data: { sortOrder: idx } })),
  );
}

export async function removeSignup(eventId: string, signupId: string) {
  await db.signup.deleteMany({ where: { id: signupId, eventId } });
}
