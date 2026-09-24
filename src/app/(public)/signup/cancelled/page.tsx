import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign-up cancelled", robots: { index: false } };

export default function CancelledPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <h1 className="heading text-3xl">Your sign-up was cancelled</h1>
      <p className="mt-3 text-navy-700">
        Thanks for letting us know. Those items are open for other families again.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        See upcoming events
      </Link>
    </div>
  );
}
