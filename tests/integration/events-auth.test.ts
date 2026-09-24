import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeMagicLink, findAllowedOrganizer, requestMagicLink } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteEvent, deleteItem, updateItem } from "@/lib/events";
import { rateLimit } from "@/lib/rate-limit";
import { createSignup } from "@/lib/signups";
import { hashToken } from "@/lib/tokens";
import { makeEvent, parent, resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(() => db.$disconnect());

describe("organizer item management", () => {
  it("won't lower quantity below what parents claimed", async () => {
    const { event, items } = await makeEvent({ items: [["Cookies", 6]] });
    const id = items[0]!.id;
    await createSignup(event.id, parent(), { [id]: 4 });

    const base = { name: "Cookies", notes: "", productUrl: null };
    expect((await updateItem(event.id, id, { ...base, quantityNeeded: 3 })).ok).toBe(false);
    expect((await updateItem(event.id, id, { ...base, quantityNeeded: 4 })).ok).toBe(true);
  });

  it("won't delete a claimed item, but deleting the whole event cascades", async () => {
    const { event, items } = await makeEvent();
    await createSignup(event.id, parent(), { [items[0]!.id]: 1 });
    expect((await deleteItem(event.id, items[0]!.id)).ok).toBe(false);

    await deleteEvent(event.id);
    expect(await db.item.count()).toBe(0);
    expect(await db.signup.count()).toBe(0);
  });

  it("scopes item edits to their event", async () => {
    const a = await makeEvent();
    const b = await makeEvent();
    const r = await updateItem(a.event.id, b.items[0]!.id, {
      name: "x",
      notes: "",
      productUrl: null,
      quantityNeeded: 1,
    });
    expect(r.ok).toBe(false);
  });
});

describe("magic-link sign-in", () => {
  it("bootstraps ADMIN_EMAILS as admins and ignores unknown emails", async () => {
    expect((await findAllowedOrganizer("Admin@Example.com"))?.role).toBe("ADMIN");
    expect(await findAllowedOrganizer("stranger@example.com")).toBeNull();
  });

  it("does not email unknown addresses", async () => {
    await requestMagicLink("stranger@example.com");
    expect(await db.magicLinkToken.count()).toBe(0);
  });

  it("links are single-use and expire", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    await requestMagicLink("admin@example.com");
    const token = /token=([\w-]+)/.exec(String(log.mock.calls.at(-1)?.[0]))?.[1];
    log.mockRestore();
    expect(token).toBeTruthy();

    const session = await consumeMagicLink(token!);
    expect(session).toBeTruthy();
    expect(await db.session.count({ where: { tokenHash: hashToken(session!) } })).toBe(1);
    expect(await consumeMagicLink(token!)).toBeNull();

    await db.magicLinkToken.create({
      data: {
        email: "admin@example.com",
        tokenHash: hashToken("old"),
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    expect(await consumeMagicLink("old")).toBeNull();
  });

  it("deactivated organizers can't sign in", async () => {
    await db.organizer.create({ data: { email: "former@example.com", active: false } });
    expect(await findAllowedOrganizer("former@example.com")).toBeNull();
  });
});

describe("rateLimit", () => {
  it("allows up to the limit within the window", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("t", "1.2.3.4", 3, 60_000));
    expect(results).toEqual([true, true, true, false]);
    expect(await rateLimit("t", "5.6.7.8", 3, 60_000)).toBe(true);
  });
});
