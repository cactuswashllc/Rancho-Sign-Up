import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrganizer } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Organizer sign-in" };

export default async function LoginPage() {
  if (await getCurrentOrganizer()) redirect("/organizer");
  return (
    <>
      <p className="eyebrow">PTO organizers</p>
      <h1 className="heading mt-1 mb-6 text-3xl">Sign in</h1>
      <LoginForm />
      <p className="mt-6 text-sm text-navy-500">
        No password needed — we&apos;ll email you a one-time link. Ask a PTO admin to add you if you&apos;re
        new.
      </p>
    </>
  );
}
