import Link from "next/link";
import { Crest } from "./Crest";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-navy-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Crest className="h-11 w-10 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block font-serif text-base leading-snug font-semibold tracking-wide text-navy-900 sm:text-xl">
              Rancho Solano Preparatory School
            </span>
            <span className="eyebrow block text-[0.65rem]">PTO Event Sign-Ups</span>
          </span>
        </Link>
        {right}
      </div>
    </header>
  );
}
