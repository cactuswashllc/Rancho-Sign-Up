"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cancelSignup, updateSignup } from "@/lib/signups";
import { claimsSchema, readClaims } from "@/lib/validation";
import { sendConfirmation } from "@/lib/notifications";

export interface ManageFormState {
  error?: string;
  itemErrors?: Record<string, string>;
}

async function limited() {
  const ip = clientIp(await headers());
  return !(await rateLimit("manage", ip, 30, 10 * 60 * 1000));
}

export async function saveChanges(
  token: string,
  _prev: ManageFormState,
  formData: FormData,
): Promise<ManageFormState> {
  if (await limited()) return { error: "Too many changes. Please wait a few minutes and try again." };
  const claims = claimsSchema.safeParse(readClaims(formData));
  if (!claims.success) return { error: "Please check the quantities you entered." };

  const result = await updateSignup(token, claims.data);
  if (!result.ok) return { error: result.error, itemErrors: result.itemErrors };

  if (Object.keys(claims.data).length === 0) redirect("/signup/cancelled");
  await sendConfirmation(result.signupId, token, true);
  redirect(`/signup/${encodeURIComponent(token)}?updated=1`);
}

export async function cancel(token: string): Promise<void> {
  if (await limited()) return;
  await cancelSignup(token);
  redirect("/signup/cancelled");
}
