"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendConfirmation } from "@/lib/notifications";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSignup } from "@/lib/signups";
import { claimsSchema, fieldErrors, parentSchema, readClaims, type FieldErrors } from "@/lib/validation";

export interface SignupFormState {
  error?: string;
  fieldErrors?: FieldErrors;
  itemErrors?: Record<string, string>;
}

export async function submitSignup(
  eventId: string,
  _prev: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  // Honeypot: real people never fill in the hidden "website" field.
  if (formData.get("website")) return { error: "Something went wrong. Please try again." };

  const ip = clientIp(await headers());
  if (!(await rateLimit("signup", ip, 10, 10 * 60 * 1000)))
    return { error: "Too many sign-ups from this device. Please wait a few minutes and try again." };

  const parent = parentSchema.safeParse({
    parentName: formData.get("parentName"),
    parentEmail: formData.get("parentEmail"),
    studentName: formData.get("studentName"),
    grade: formData.get("grade"),
  });
  const claims = claimsSchema.safeParse(readClaims(formData));
  if (!claims.success) return { error: "Please check the quantities you entered." };
  if (!parent.success)
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parent.error) };

  const result = await createSignup(eventId, parent.data, claims.data);
  if (!result.ok) return { error: result.error, itemErrors: result.itemErrors };

  await sendConfirmation(result.signupId, result.token);
  redirect(`/signup/${encodeURIComponent(result.token)}?new=1`);
}
