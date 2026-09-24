import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { verify } from "../actions";

export const metadata: Metadata = { title: "Finish signing in" };

type Props = { searchParams: Promise<{ token?: string; error?: string }> };

/**
 * The emailed link lands here and the token is only consumed when the
 * organizer presses the button (a POST). Email security scanners that
 * pre-fetch links therefore can't burn the one-time token.
 */
export default async function VerifyPage({ searchParams }: Props) {
  const { token, error } = await searchParams;
  if (error || !token)
    return (
      <div className="card p-6 text-center">
        <h1 className="heading text-2xl">That link didn&apos;t work</h1>
        <p className="mt-2 text-navy-700">Sign-in links expire after 20 minutes and can only be used once.</p>
        <Link href="/organizer/login" className="btn btn-primary mt-6">
          Request a new link
        </Link>
      </div>
    );
  return (
    <form action={verify.bind(null, token)} className="card p-6 text-center">
      <h1 className="heading text-2xl">Finish signing in</h1>
      <p className="mt-2 text-navy-700">Press the button to continue to the organizer dashboard.</p>
      <SubmitButton className="btn btn-primary mt-6 w-full" pendingText="Signing in…">
        Continue
      </SubmitButton>
    </form>
  );
}
