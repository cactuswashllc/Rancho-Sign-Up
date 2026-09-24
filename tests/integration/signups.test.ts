import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { cancelSignup, createSignup, findSignupByToken, getAvailability, updateSignup } from "@/lib/signups";
import { makeEvent, parent, resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(() => db.$disconnect());

describe("createSignup", () => {
  it("records a claim and reduces what's remaining", async () => {
    const { event, items } = await makeEvent({
      items: [
        ["Juice boxes", 6],
        ["Napkins", 2],
      ],
    });
    const r = await createSignup(event.id, parent(), { [items[0]!.id]: 4, [items[1]!.id]: 2 });
    expect(r.ok).toBe(true);

    const avail = await getAvailability(event.id);
    expect(avail.map((a) => [a.name, a.claimed, a.remaining])).toEqual([
      ["Juice boxes", 4, 2],
      ["Napkins", 2, 0],
    ]);
  });

  it("stores only a hash of the manage token", async () => {
    const { event, items } = await makeEvent();
    const r = await createSignup(event.id, parent(), { [items[0]!.id]: 1 });
    if (!r.ok) throw new Error(r.error);
    const row = await db.signup.findUniqueOrThrow({ where: { id: r.signupId } });
    expect(row.editTokenHash).not.toContain(r.token);
    expect((await findSignupByToken(r.token))?.id).toBe(r.signupId);
    expect(await findSignupByToken("wrong")).toBeNull();
  });

  it("refuses to over-claim", async () => {
    const { event, items } = await makeEvent({ items: [["Cups", 3]] });
    await createSignup(event.id, parent(1), { [items[0]!.id]: 2 });
    const r = await createSignup(event.id, parent(2), { [items[0]!.id]: 2 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.itemErrors?.[items[0]!.id]).toMatch(/Only 1/);
  });

  it("never over-claims under concurrent sign-ups", async () => {
    const { event, items } = await makeEvent({ items: [["Pumpkins", 5]] });
    const itemId = items[0]!.id;
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => createSignup(event.id, parent(i), { [itemId]: 1 })),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(5);
    const [avail] = await getAvailability(event.id);
    expect(avail!.claimed).toBe(5);
    expect(avail!.remaining).toBe(0);
  });

  it("rejects items from another event", async () => {
    const a = await makeEvent();
    const b = await makeEvent();
    const r = await createSignup(a.event.id, parent(), { [b.items[0]!.id]: 1 });
    expect(r.ok).toBe(false);
  });

  it("rejects sign-ups when the event is not open", async () => {
    for (const status of ["DRAFT", "CLOSED"] as const) {
      const { event, items } = await makeEvent({ status });
      const r = await createSignup(event.id, parent(), { [items[0]!.id]: 1 });
      expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/closed/) });
    }
  });

  it("requires at least one item", async () => {
    const { event } = await makeEvent();
    expect((await createSignup(event.id, parent(), {})).ok).toBe(false);
  });
});

describe("updateSignup / cancelSignup", () => {
  it("lets a parent increase up to remaining + their own claim", async () => {
    const { event, items } = await makeEvent({ items: [["Plates", 5]] });
    const id = items[0]!.id;
    const mine = await createSignup(event.id, parent(1), { [id]: 2 });
    await createSignup(event.id, parent(2), { [id]: 1 });
    if (!mine.ok) throw new Error();

    expect((await updateSignup(mine.token, { [id]: 4 })).ok).toBe(true);
    expect((await updateSignup(mine.token, { [id]: 5 })).ok).toBe(false);
    const [avail] = await getAvailability(event.id);
    expect(avail!.claimed).toBe(5);
  });

  it("cancels when every quantity is zero", async () => {
    const { event, items } = await makeEvent();
    const r = await createSignup(event.id, parent(), { [items[0]!.id]: 1 });
    if (!r.ok) throw new Error();
    expect((await updateSignup(r.token, {})).ok).toBe(true);
    expect(await db.signup.count()).toBe(0);
  });

  it("cancelSignup removes the claim, only while open", async () => {
    const { event, items } = await makeEvent();
    const r = await createSignup(event.id, parent(), { [items[0]!.id]: 3 });
    if (!r.ok) throw new Error();

    await db.event.update({ where: { id: event.id }, data: { status: "CLOSED" } });
    expect(await cancelSignup(r.token)).toBe(false);

    await db.event.update({ where: { id: event.id }, data: { status: "OPEN" } });
    expect(await cancelSignup(r.token)).toBe(true);
    const [avail] = await getAvailability(event.id);
    expect(avail!.remaining).toBe(6);
  });

  it("rejects an unknown token", async () => {
    expect((await updateSignup("nope", {})).ok).toBe(false);
  });
});
