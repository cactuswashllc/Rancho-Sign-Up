import { describe, expect, it } from "vitest";
import { claimsSchema, eventSchema, itemSchema, parentSchema, readClaims } from "@/lib/validation";

describe("parentSchema", () => {
  const valid = {
    parentName: " Jane Doe ",
    parentEmail: "Jane@Example.com ",
    studentName: "Sam",
    grade: "3rd",
  };

  it("trims and lowercases", () => {
    expect(parentSchema.parse(valid)).toEqual({
      parentName: "Jane Doe",
      parentEmail: "jane@example.com",
      studentName: "Sam",
      grade: "3rd",
    });
  });

  it("requires every field", () => {
    const r = parentSchema.safeParse({ parentName: "", parentEmail: "bad", studentName: " ", grade: "13th" });
    expect(r.success).toBe(false);
    const fields = r.error!.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["parentName", "parentEmail", "studentName", "grade"]));
  });
});

describe("claims", () => {
  it("reads qty[...] fields and drops zeros", () => {
    const fd = new FormData();
    fd.set("qty[a]", "2");
    fd.set("qty[b]", "0");
    fd.set("parentName", "x");
    expect(claimsSchema.parse(readClaims(fd))).toEqual({ a: 2 });
  });

  it("rejects negative and fractional quantities", () => {
    expect(claimsSchema.safeParse({ a: "-1" }).success).toBe(false);
    expect(claimsSchema.safeParse({ a: "1.5" }).success).toBe(false);
  });
});

describe("eventSchema", () => {
  const base = {
    title: "Halloween Party",
    eventDate: "2026-10-30",
    location: "",
    description: "",
    themeKey: "halloween",
    amazonListUrl: "",
  };

  it("accepts a minimal event", () => {
    const r = eventSchema.parse(base);
    expect(r.location).toBeNull();
    expect(r.amazonListUrl).toBeNull();
    expect(r.status).toBeUndefined();
  });

  it("rejects non-Amazon list links and unknown themes", () => {
    const r = eventSchema.safeParse({ ...base, amazonListUrl: "https://example.com", themeKey: "x" });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0]).sort()).toEqual(["amazonListUrl", "themeKey"]);
  });
});

describe("itemSchema", () => {
  it("coerces quantity and bounds it", () => {
    expect(
      itemSchema.parse({ name: "Plates", notes: "", productUrl: "", quantityNeeded: "4" }).quantityNeeded,
    ).toBe(4);
    expect(
      itemSchema.safeParse({ name: "Plates", notes: "", productUrl: "", quantityNeeded: "0" }).success,
    ).toBe(false);
  });
});
