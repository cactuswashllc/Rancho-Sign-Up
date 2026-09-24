import { describe, expect, it } from "vitest";
import { eventSlug, slugify } from "@/lib/slug";
import { DEFAULT_THEME_KEY, getTheme, isThemeKey, THEMES } from "@/lib/themes";

describe("slug", () => {
  it("slugifies titles", () => {
    expect(slugify("3rd Grade Halloween Party!")).toBe("3rd-grade-halloween-party");
    expect(slugify("Café & Crêpes")).toBe("cafe-crepes");
    expect(slugify("!!!")).toBe("event");
  });

  it("adds a random suffix", () => {
    expect(eventSlug("Fall Fest")).toMatch(/^fall-fest-[0-9a-f]{6}$/);
    expect(eventSlug("x")).not.toBe(eventSlug("x"));
  });
});

describe("themes", () => {
  it("has unique keys and valid hex colors", () => {
    const keys = THEMES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const t of THEMES) {
      expect(t.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(t.accentSoft).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("covers the major school-year holidays", () => {
    for (const key of ["halloween", "thanksgiving", "winter-holidays", "valentines", "st-patricks", "spring"])
      expect(isThemeKey(key)).toBe(true);
  });

  it("falls back to the default theme", () => {
    expect(getTheme("nope").key).toBe(DEFAULT_THEME_KEY);
    expect(getTheme(null).key).toBe(DEFAULT_THEME_KEY);
  });
});
