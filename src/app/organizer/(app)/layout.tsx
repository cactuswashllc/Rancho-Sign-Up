import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { requireOrganizer } from "@/lib/auth";
import { signOutAction } from "./actions";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const organizer = await requireOrganizer();
  return (
    <>
      <SiteHeader
        right={
          <form action={signOutAction}>
            <button className="btn btn-ghost px-3 text-sm whitespace-nowrap" type="submit">
              Sign out
            </button>
          </form>
        }
      />
      <nav className="border-b border-navy-100 bg-navy-50" aria-label="Organizer">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 text-sm sm:px-6">
          <Link href="/organizer" className="px-3 py-3 font-semibold text-navy-900 hover:underline">
            Events
          </Link>
          {organizer.role === "ADMIN" && (
            <Link href="/organizer/team" className="px-3 py-3 font-semibold text-navy-900 hover:underline">
              Organizers
            </Link>
          )}
          <Link href="/" className="px-3 py-3 text-navy-700 hover:underline">
            Public site
          </Link>
          <span className="ml-auto hidden truncate py-3 text-navy-500 sm:block">{organizer.email}</span>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
