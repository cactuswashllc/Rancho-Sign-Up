import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { hashToken, newToken } from "./tokens";
import type { ParentInput } from "./validation";

type Tx = Prisma.TransactionClient;
export type Claims = Record<string, number>;

export type SignupResult =
  | { ok: true; token: string; signupId: string }
  | { ok: false; error: string; itemErrors?: Record<string, string> };

export interface ItemAvailability {
  id: string;
  name: string;
  notes: string;
  quantityNeeded: number;
  claimed: number;
  remaining: number;
}

/** Items for an event with claimed/remaining counts, in display order. */
export async function getAvailability(eventId: string): Promise<ItemAvailability[]> {
  const [items, sums] = await Promise.all([
    db.item.findMany({
      where: { eventId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.signupItem.groupBy({
      by: ["itemId"],
      where: { item: { eventId } },
      _sum: { quantity: true },
    }),
  ]);
  const claimedBy = new Map(sums.map((s) => [s.itemId, s._sum.quantity ?? 0]));
  return items.map((i) => {
    const claimed = claimedBy.get(i.id) ?? 0;
    return {
      id: i.id,
      name: i.name,
      notes: i.notes,
      quantityNeeded: i.quantityNeeded,
      claimed,
      remaining: Math.max(0, i.quantityNeeded - claimed),
    };
  });
}

/**
 * Lock the given items (row locks, in id order to avoid deadlocks) and return
 * how many of each are still available, optionally ignoring one signup's own
 * existing claims (used when a parent edits their sign-up).
 */
async function lockAndCount(tx: Tx, eventId: string, itemIds: string[], excludeSignupId?: string) {
  const ids = [...new Set(itemIds)].sort();
  if (ids.length === 0) return new Map<string, { name: string; remaining: number }>();

  const rows = await tx.$queryRaw<{ id: string; name: string; quantityNeeded: number }[]>`
    SELECT id, name, "quantityNeeded" FROM "Item"
    WHERE "eventId" = ${eventId} AND id = ANY(${ids}::text[])
    ORDER BY id
    FOR UPDATE`;

  const sums = await tx.signupItem.groupBy({
    by: ["itemId"],
    where: {
      itemId: { in: ids },
      ...(excludeSignupId ? { signupId: { not: excludeSignupId } } : {}),
    },
    _sum: { quantity: true },
  });
  const claimedBy = new Map(sums.map((s) => [s.itemId, s._sum.quantity ?? 0]));

  return new Map(
    rows.map((r) => [r.id, { name: r.name, remaining: r.quantityNeeded - (claimedBy.get(r.id) ?? 0) }]),
  );
}

function checkClaims(
  claims: Claims,
  available: Map<string, { name: string; remaining: number }>,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  for (const [itemId, qty] of Object.entries(claims)) {
    const a = available.get(itemId);
    if (!a) errors[itemId] = "This item is no longer available.";
    else if (qty > a.remaining)
      errors[itemId] =
        a.remaining <= 0
          ? `${a.name} was just fully claimed by someone else.`
          : `Only ${a.remaining} of ${a.name} still needed.`;
  }
  return Object.keys(errors).length ? errors : null;
}

async function assertOpen(tx: Tx, eventId: string): Promise<string | null> {
  const event = await tx.event.findUnique({ where: { id: eventId }, select: { status: true } });
  if (!event) return "This event could not be found.";
  if (event.status !== "OPEN") return "Sign-ups for this event are closed.";
  return null;
}

export async function createSignup(
  eventId: string,
  parent: ParentInput,
  claims: Claims,
): Promise<SignupResult> {
  if (Object.keys(claims).length === 0) return { ok: false, error: "Choose at least one item to bring." };

  const token = newToken();
  return db.$transaction(async (tx) => {
    const closed = await assertOpen(tx, eventId);
    if (closed) return { ok: false, error: closed };

    const available = await lockAndCount(tx, eventId, Object.keys(claims));
    const itemErrors = checkClaims(claims, available);
    if (itemErrors) return { ok: false, error: "Some quantities are no longer available.", itemErrors };

    const signup = await tx.signup.create({
      data: {
        eventId,
        ...parent,
        editTokenHash: hashToken(token),
        items: {
          create: Object.entries(claims).map(([itemId, quantity]) => ({ itemId, quantity })),
        },
      },
    });
    return { ok: true, token, signupId: signup.id };
  });
}

export async function findSignupByToken(token: string) {
  if (!token || token.length > 100) return null;
  return db.signup.findUnique({
    where: { editTokenHash: hashToken(token) },
    include: {
      event: { include: { images: { orderBy: { sortOrder: "asc" } } } },
      items: { include: { item: true } },
    },
  });
}

/**
 * Replace a sign-up's claims. Claiming nothing cancels the sign-up.
 * Returns the same token on success so callers can redirect back.
 */
export async function updateSignup(token: string, claims: Claims): Promise<SignupResult> {
  const tokenHash = hashToken(token);
  return db.$transaction(async (tx) => {
    const signup = await tx.signup.findUnique({
      where: { editTokenHash: tokenHash },
      include: { items: true },
    });
    if (!signup) return { ok: false, error: "This sign-up link is no longer valid." };

    const closed = await assertOpen(tx, signup.eventId);
    if (closed) return { ok: false, error: closed };

    if (Object.keys(claims).length === 0) {
      await tx.signup.delete({ where: { id: signup.id } });
      return { ok: true, token, signupId: signup.id };
    }

    const available = await lockAndCount(
      tx,
      signup.eventId,
      [...Object.keys(claims), ...signup.items.map((i) => i.itemId)],
      signup.id,
    );
    const itemErrors = checkClaims(claims, available);
    if (itemErrors) return { ok: false, error: "Some quantities are no longer available.", itemErrors };

    await tx.signupItem.deleteMany({ where: { signupId: signup.id } });
    await tx.signupItem.createMany({
      data: Object.entries(claims).map(([itemId, quantity]) => ({
        signupId: signup.id,
        itemId,
        quantity,
      })),
    });
    await tx.signup.update({ where: { id: signup.id }, data: { updatedAt: new Date() } });
    return { ok: true, token, signupId: signup.id };
  });
}

export async function cancelSignup(token: string): Promise<boolean> {
  const { count } = await db.signup.deleteMany({
    where: { editTokenHash: hashToken(token), event: { status: "OPEN" } },
  });
  return count > 0;
}
