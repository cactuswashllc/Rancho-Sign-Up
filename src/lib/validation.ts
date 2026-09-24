import { z } from "zod";
import { normalizeAmazonUrl } from "./amazon";
import { parseDateInput } from "./dates";
import { GRADES } from "./grades";
import { isThemeKey } from "./themes";

const trimmed = (max: number) => z.string().trim().max(max);
const required = (label: string, max: number) => trimmed(max).min(1, `${label} is required`);

const optionalAmazonUrl = z
  .string()
  .trim()
  .max(2000)
  .transform((v, ctx) => {
    if (!v) return null;
    const url = normalizeAmazonUrl(v);
    if (!url) {
      ctx.addIssue({ code: "custom", message: "Must be an amazon.com link" });
      return z.NEVER;
    }
    return url;
  });

export const eventSchema = z.object({
  title: required("Title", 120),
  eventDate: z.string().transform((v, ctx) => {
    const d = parseDateInput(v);
    if (!d) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date" });
      return z.NEVER;
    }
    return d;
  }),
  location: trimmed(120).transform((v) => v || null),
  description: trimmed(4000),
  themeKey: z.string().refine(isThemeKey, "Choose a theme"),
  amazonListUrl: optionalAmazonUrl,
  headerText: trimmed(160)
    .optional()
    .transform((v) => v || null),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

export const itemSchema = z.object({
  name: required("Item name", 120),
  notes: trimmed(500),
  quantityNeeded: z.coerce.number().int("Whole numbers only").min(1, "At least 1").max(1000, "At most 1000"),
});

export type ItemInput = z.infer<typeof itemSchema>;

export const parentSchema = z.object({
  parentName: required("Your name", 100),
  parentEmail: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email")),
  studentName: required("Student name", 100),
  grade: z.enum(GRADES, "Choose a grade"),
});

export type ParentInput = z.infer<typeof parentSchema>;

/** Map of itemId → quantity (only positive quantities are kept). */
export const claimsSchema = z
  .record(z.string().min(1).max(40), z.coerce.number().int().min(0).max(1000))
  .transform((r) => Object.fromEntries(Object.entries(r).filter(([, q]) => q > 0)));

export const organizerEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email"));

/** Read `qty[<itemId>]` fields from a FormData into a plain record. */
export function readClaims(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    const m = /^qty\[(.+)\]$/.exec(k);
    if (m && typeof v === "string") out[m[1]!] = v;
  }
  return out;
}

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
