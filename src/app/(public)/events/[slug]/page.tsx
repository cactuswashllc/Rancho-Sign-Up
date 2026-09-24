import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AmazonButton } from "@/components/AmazonButton";
import { MotifIcon } from "@/components/Motif";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ThemeBanner } from "@/components/ThemeBanner";
import { getCurrentOrganizer } from "@/lib/auth";
import { formatEventDate } from "@/lib/dates";
import { getPublicEvent } from "@/lib/events";
import { getAvailability } from "@/lib/signups";
import { getTheme } from "@/lib/themes";
import { submitSignup } from "./actions";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function loadVisibleEvent(slug: string) {
  const event = await getPublicEvent(slug);
  if (!event) return null;
  if (event.status === "DRAFT" && !(await getCurrentOrganizer())) return null;
  return event;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await loadVisibleEvent((await params).slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: `Sign up to help with ${event.title} on ${formatEventDate(event.eventDate)}.`,
    openGraph: event.images[0] ? { images: [event.images[0].url] } : undefined,
  };
}

export default async function EventPage({ params }: Props) {
  const event = await loadVisibleEvent((await params).slug);
  if (!event) notFound();

  const theme = getTheme(event.themeKey);
  const items = await getAvailability(event.id);
  const totalNeeded = items.reduce((n, i) => n + i.quantityNeeded, 0);
  const totalClaimed = items.reduce((n, i) => n + Math.min(i.claimed, i.quantityNeeded), 0);
  const allCovered = items.length > 0 && items.every((i) => i.remaining <= 0);

  return (
    <div style={{ "--accent": theme.accent, "--accent-soft": theme.accentSoft } as React.CSSProperties}>
      {event.status === "DRAFT" && (
        <p className="bg-gold px-4 py-2 text-center text-sm font-semibold text-navy-950">
          Draft preview — only organizers can see this page until it&apos;s opened.
        </p>
      )}
      <ThemeBanner theme={theme}>
        <p
          className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] uppercase"
          style={{ color: theme.accent }}
        >
          <MotifIcon motif={theme.motif} className="h-4 w-4" />
          {theme.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{event.title}</h1>
        <p className="mt-3 text-lg text-navy-100">
          {formatEventDate(event.eventDate)}
          {event.location && <span className="text-navy-300"> · {event.location}</span>}
        </p>
        <p className="mt-2 font-serif text-lg italic text-navy-300">{theme.tagline}</p>
      </ThemeBanner>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <PhotoGallery images={event.images} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          {event.description ? (
            <div className="whitespace-pre-line text-base leading-relaxed text-navy-800">
              {event.description}
            </div>
          ) : (
            <div />
          )}
          <aside className="card h-fit p-5" style={{ background: theme.accentSoft }}>
            <p className="eyebrow">Progress</p>
            <p className="mt-1 font-serif text-3xl font-semibold">
              {totalClaimed} <span className="text-lg text-navy-500">of {totalNeeded} covered</span>
            </p>
            {event.amazonListUrl && (
              <div className="mt-4">
                <AmazonButton href={event.amazonListUrl} />
                <p className="mt-2 text-xs text-navy-700">
                  Sign up here first so we know who&apos;s bringing what, then purchase from the list.
                </p>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-10">
          {event.status === "CLOSED" ? (
            <p className="card p-8 text-center text-navy-700">
              Sign-ups for this event are closed. Thank you to everyone who helped!
            </p>
          ) : items.length === 0 ? (
            <p className="card p-8 text-center text-navy-700">
              Items will be posted soon — check back shortly.
            </p>
          ) : allCovered ? (
            <p className="card p-8 text-center text-navy-700">
              Everything is covered — thank you, Rancho Solano families!
            </p>
          ) : (
            <SignupForm items={items} action={submitSignup.bind(null, event.id)} />
          )}
        </div>
      </div>
    </div>
  );
}
