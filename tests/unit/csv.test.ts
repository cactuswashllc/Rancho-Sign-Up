import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(toCsv([["a,b", 'say "hi"', "line\nbreak", 3]])).toBe('"a,b","say ""hi""","line\nbreak",3\r\n');
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(toCsv([["=HYPERLINK(1)", "+1", "-2", "@x", "safe"]])).toBe("'=HYPERLINK(1),'+1,'-2,'@x,safe\r\n");
  });
});
