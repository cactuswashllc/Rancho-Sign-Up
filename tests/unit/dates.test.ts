import { describe, expect, it } from "vitest";
import { formatEventDate, parseDateInput, todayInSchoolTz, toDateInputValue } from "@/lib/dates";

describe("dates", () => {
  it("round-trips a date input", () => {
    const d = parseDateInput("2026-10-31");
    expect(d?.toISOString()).toBe("2026-10-31T00:00:00.000Z");
    expect(toDateInputValue(d!)).toBe("2026-10-31");
  });

  it("rejects invalid dates", () => {
    expect(parseDateInput("2026-02-30")).toBeNull();
    expect(parseDateInput("10/31/2026")).toBeNull();
    expect(parseDateInput("")).toBeNull();
  });

  it("formats in UTC so the calendar day never shifts", () => {
    expect(formatEventDate(new Date("2026-10-31T00:00:00Z"))).toBe("Saturday, October 31, 2026");
  });

  it("computes today in Arizona time", () => {
    // 03:00 UTC on Nov 1 is still Oct 31 in Phoenix (UTC-7).
    expect(todayInSchoolTz(new Date("2026-11-01T03:00:00Z")).toISOString()).toBe("2026-10-31T00:00:00.000Z");
  });
});
