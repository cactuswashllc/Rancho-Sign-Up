import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/organizer/ConfirmButton";
import { EventForm } from "@/components/organizer/EventForm";
import { HeaderImageManager } from "@/components/organizer/HeaderImageManager";
import { ImageManager } from "@/components/organizer/ImageManager";
import { ItemsEditor } from "@/components/organizer/ItemsEditor";
import { ShareLink } from "@/components/organizer/ShareLink";
import { StatusBadge } from "@/components/organizer/StatusBadge";
import { toDateInputValue } from "@/lib/dates";
import { appUrl, env } from "@/lib/env";
import { getEventForOrganizer } from "@/lib/events";
import { getAvailability } from "@/lib/signups";
import { getTheme } from "@/lib/themes";
import {
  addImageAction,
  addItemAction,
  deleteEventAction,
  deleteItemAction,
  makeCoverAction,
  removeHeaderImageAction,
  moveItemAction,
  removeImageAction,
  removeSignupAction,
  setHeaderImageAction,
  setStatusAction,
  updateEventAction,
  updateItemAction,
} from "../../actions";

export const metadata: Metadata = { title: "Edit event" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const event = await getEventForOrganizer(id);
  if (!event) notFound();
  const items = await getAvailability(event.id);
  const publicUrl = `${appUrl()}/events/${event.slug}`;

  return (
    <>
      <Link href="/organizer" className="text-sm text-navy-700 hover:underline">
        ← All events
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="heading text-3xl">{event.title}</h1>
        <StatusBadge status={event.status} />
      </div>
      {created && (
        <p className="mt-3 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-900" role="status">
          Event created. Add items and photos below, then set the status to <strong>Open</strong> to start
          sign-ups.
        </p>
      )}

      <section className="card mt-6 p-5 sm:p-6" aria-labelledby="share-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="share-h" className="text-lg font-semibold">
            Share with parents
          </h2>
          <div className="flex flex-wrap gap-2">
            {event.status !== "OPEN" && (
              <form action={setStatusAction.bind(null, event.id, "OPEN")}>
                <button className="btn btn-primary" type="submit">
                  Open sign-ups
                </button>
              </form>
            )}
            {event.status === "OPEN" && (
              <form action={setStatusAction.bind(null, event.id, "CLOSED")}>
                <button className="btn btn-secondary" type="submit">
                  Close sign-ups
                </button>
              </form>
            )}
          </div>
        </div>
        <ShareLink url={publicUrl} />
      </section>

      <section className="card mt-6 p-5 sm:p-8" aria-labelledby="items-h">
        <h2 id="items-h" className="heading text-2xl">
          Items needed
        </h2>
        <ItemsEditor
          items={items}
          addAction={addItemAction.bind(null, event.id)}
          updateAction={updateItemAction.bind(null, event.id)}
          deleteAction={deleteItemAction.bind(null, event.id)}
          moveAction={moveItemAction.bind(null, event.id)}
        />
      </section>

      <section className="card mt-6 p-5 sm:p-8" aria-labelledby="signups-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="signups-h" className="heading text-2xl">
            Sign-ups <span className="text-lg text-navy-500">({event.signups.length})</span>
          </h2>
          {event.signups.length > 0 && (
            <a href={`/organizer/events/${event.id}/export`} className="btn btn-secondary">
              Download CSV
            </a>
          )}
        </div>
        {event.signups.length === 0 ? (
          <p className="mt-4 text-navy-700">No sign-ups yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {event.signups.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-navy-900">
                    {s.parentName}{" "}
                    <a
                      href={`mailto:${s.parentEmail}`}
                      className="font-normal text-navy-700 underline underline-offset-2"
                    >
                      {s.parentEmail}
                    </a>
                  </p>
                  <p className="text-navy-700">
                    {s.studentName} · {s.grade}
                  </p>
                  <p className="mt-1 text-navy-800">
                    {s.items.map((l) => `${l.quantity} × ${l.item.name}`).join(", ")}
                  </p>
                </div>
                <ConfirmButton
                  action={removeSignupAction.bind(null, event.id, s.id)}
                  label="Remove"
                  confirmLabel="Remove this sign-up?"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-6 p-5 sm:p-8" aria-labelledby="header-h">
        <h2 id="header-h" className="heading text-2xl">
          Header image
        </h2>
        <p className="mt-1 text-sm text-navy-700">
          Optional. Replaces the theme pattern behind the event name. Edit the header text under Event
          details.
        </p>
        <HeaderImageManager
          eventId={event.id}
          theme={getTheme(event.themeKey)}
          title={event.title}
          headerText={event.headerText}
          imageUrl={event.headerImageUrl}
          uploadsEnabled={!!env().BLOB_READ_WRITE_TOKEN}
          setAction={setHeaderImageAction.bind(null, event.id)}
          removeAction={removeHeaderImageAction.bind(null, event.id)}
        />
      </section>

      <section className="card mt-6 p-5 sm:p-8" aria-labelledby="photos-h">
        <h2 id="photos-h" className="heading text-2xl">
          Photos
        </h2>
        <p className="mt-1 text-sm text-navy-700">The first photo is used as the cover image.</p>
        <ImageManager
          eventId={event.id}
          images={event.images}
          uploadsEnabled={!!env().BLOB_READ_WRITE_TOKEN}
          addAction={addImageAction.bind(null, event.id)}
          removeAction={removeImageAction.bind(null, event.id)}
          coverAction={makeCoverAction.bind(null, event.id)}
        />
      </section>

      <section className="card mt-6 p-5 sm:p-8" aria-labelledby="details-h">
        <h2 id="details-h" className="heading mb-6 text-2xl">
          Event details &amp; theme
        </h2>
        <EventForm
          action={updateEventAction.bind(null, event.id)}
          submitLabel="Save details"
          headerImageUrl={event.headerImageUrl}
          initial={{
            title: event.title,
            eventDate: toDateInputValue(event.eventDate),
            location: event.location ?? "",
            description: event.description,
            themeKey: event.themeKey,
            amazonListUrl: event.amazonListUrl ?? "",
            headerText: event.headerText ?? "",
            status: event.status,
          }}
        />
      </section>

      <section className="mt-6 rounded-lg border border-red-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-red-900">Delete event</h2>
        <p className="mt-1 text-sm text-navy-700">
          Permanently removes the event, its items, photos, and all sign-ups.
        </p>
        <div className="mt-3">
          <ConfirmButton
            action={deleteEventAction.bind(null, event.id)}
            label="Delete event"
            confirmLabel="Delete forever?"
          />
        </div>
      </section>
    </>
  );
}
