import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="heading text-3xl">Page not found</h1>
        <p className="mt-3 text-navy-700">This event or link may have been removed or is no longer active.</p>
        <Link href="/" className="btn btn-primary mt-8">
          See upcoming events
        </Link>
      </main>
    </>
  );
}
