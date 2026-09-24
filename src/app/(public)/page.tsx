import Image from "next/image";
import Link from "next/link";
import { MotifIcon } from "@/components/Motif";
import { ThemeBanner } from "@/components/ThemeBanner";
import { formatEventDate } from "@/lib/dates";
import { listOpenEvents } from "@/lib/events";
import { getTheme, THEMES } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listOpenEvents();

  return (
    <>
      <ThemeBanner theme={THEMES[0]!}>
        <p className="eyebrow text-navy-300">Parent Teacher Organization</p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          Help make our school events special
        </h1>
        <p className="mt-4 max-w-xl text-navy-100">
          Choose an event below, pick what you&apos;d like to bring, and we&apos;ll send you a confirmation
          with the shopping link.
        </p>
      </ThemeBanner>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="heading text-2xl sm:text-3xl">Upcoming events</h2>
        <div className="mt-2 h-px w-16 bg-gold" />

        {events.length === 0 ? (
          <p className="card mt-8 p-8 text-center text-navy-500">
            There are no open sign-ups right now. Please check back soon!
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const theme = getTheme(event.themeKey);
              const cover =
                event.images[0] ?? (event.headerImageUrl ? { url: event.headerImageUrl, alt: "" } : null);
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-navy-700"
                  >
                    <div className="relative aspect-[16/9] bg-navy-900">
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt={cover.alt}
                          fill
                          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{ color: theme.accent }}
                        >
                          <MotifIcon motif={theme.motif} className="h-16 w-16 opacity-80" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: theme.accent }} />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="eyebrow">{theme.name}</p>
                      <h3 className="heading mt-1 text-xl group-hover:underline">{event.title}</h3>
                      <p className="mt-2 text-sm text-navy-700">{formatEventDate(event.eventDate)}</p>
                      <span className="mt-auto pt-4 text-sm font-semibold text-navy-800">Sign up →</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
