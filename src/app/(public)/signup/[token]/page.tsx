import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmazonButton } from "@/components/AmazonButton";
import { ThemeBanner } from "@/components/ThemeBanner";
import { formatEventDate } from "@/lib/dates";
import { findSignupByToken, getAvailability } from "@/lib/signups";
import { getTheme } from "@/lib/themes";
import { cancel, saveChanges } from "./actions";
import { ManageForm } from "./ManageForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your sign-up", robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ new?: string; updated?: string }>;
};

export default async function ManageSignupPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  const signup = await findSignupByToken(decodeURIComponent(token));
  if (!signup) notFound();

  const { event } = signup;
  const theme = getTheme(event.themeKey);
  const availability = await getAvailability(event.id);
  const mine = new Map(signup.items.map((l) => [l.itemId, l.quantity]));
  const rows = availability
    .map((a) => ({
      id: a.id,
      name: a.name,
      mine: mine.get(a.id) ?? 0,
      max: a.remaining + (mine.get(a.id) ?? 0),
    }))
    .filter((r) => r.max > 0);
  const canEdit = event.status === "OPEN";

  return (
    <>
      <ThemeBanner theme={theme} imageUrl={event.headerImageUrl} compact>
        {sp.new ? (
          <>
            <p className="eyebrow text-navy-300">You&apos;re signed up</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
              Thank you, {signup.parentName}!
            </h1>
            <p className="mt-2 text-navy-100">
              A confirmation is on its way to <strong>{signup.parentEmail}</strong>.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow text-navy-300">{sp.updated ? "Changes saved" : "Your sign-up"}</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{event.title}</h1>
          </>
        )}
      </ThemeBanner>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className="card p-5 sm:p-8">
          <p className="eyebrow">Event</p>
          <h2 className="heading mt-1 text-2xl">
            <Link href={`/events/${event.slug}`} className="hover:underline">
              {event.title}
            </Link>
          </h2>
          <p className="mt-1 text-navy-700">
            {formatEventDate(event.eventDate)}
            {event.location && ` · ${event.location}`}
          </p>
          <p className="mt-4 text-sm text-navy-700">
            For <strong className="text-navy-900">{signup.studentName}</strong> ({signup.grade})
          </p>

          <h3 className="mt-6 font-semibold text-navy-900">You&apos;re bringing</h3>
          <ul className="mt-2 space-y-2">
            {signup.items.map((l) => (
              <li
                key={l.id}
                className="flex items-baseline justify-between gap-3 rounded-md bg-navy-50 px-3 py-2"
              >
                <span>
                  <strong>{l.quantity} ×</strong> {l.item.name}
                </span>
              </li>
            ))}
          </ul>

          {event.amazonListUrl && (
            <div className="mt-6">
              <AmazonButton href={event.amazonListUrl} />
            </div>
          )}
        </section>

        <section className="card mt-6 p-5 sm:p-8">
          <h2 className="heading text-2xl">Change your sign-up</h2>
          {canEdit ? (
            <>
              <p className="mt-1 mb-4 text-sm text-navy-700">
                Bookmark this page or keep your confirmation email — this link is private to you.
              </p>
              <ManageForm
                rows={rows}
                save={saveChanges.bind(null, token)}
                cancel={cancel.bind(null, token)}
              />
            </>
          ) : (
            <p className="mt-2 text-navy-700">
              Sign-ups for this event are closed, so changes can&apos;t be made online. Please contact the PTO
              organizer if you need help.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
