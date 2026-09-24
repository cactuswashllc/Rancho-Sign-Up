import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-navy-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-navy-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Rancho Solano Preparatory School · Parent Teacher Organization</p>
        <Link href="/organizer" className="underline-offset-4 hover:underline">
          Organizer sign-in
        </Link>
      </div>
    </footer>
  );
}
