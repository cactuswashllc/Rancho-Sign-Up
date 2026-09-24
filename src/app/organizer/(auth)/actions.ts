"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { consumeMagicLink, requestMagicLink, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { organizerEmailSchema } from "@/lib/validation";

export interface LoginState {
  sent?: boolean;
  error?: string;
}

export async function requestLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = organizerEmailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };

  const ip = clientIp(await headers());
  const allowed =
    (await rateLimit("login-ip", ip, 10, 15 * 60 * 1000)) &&
    (await rateLimit("login-email", email.data, 3, 15 * 60 * 1000));
  if (!allowed) return { error: "Too many sign-in requests. Please wait a few minutes." };

  try {
    await requestMagicLink(email.data);
  } catch (err) {
    console.error("magic link email failed", err instanceof Error ? err.message : "unknown");
    return { error: "We couldn't send the email right now. Please try again shortly." };
  }
  return { sent: true };
}

export async function verify(token: string): Promise<void> {
  const session = await consumeMagicLink(token);
  if (!session) redirect("/organizer/verify?error=invalid");
  await setSessionCookie(session);
  redirect("/organizer");
}
