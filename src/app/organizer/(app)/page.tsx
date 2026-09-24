import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/organizer/StatusBadge";
import { formatEventDate } from "@/lib/dates";
import { listEventsForOrganizer } from "@/lib/events";
import { getTheme } from "@/lib/themes";

export const metadata: Metadata = { title: "Organizer dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const events = await listEventsForOrganizer();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Organizer</p>
          <h1 className="heading text-3xl">Events</h1>
        </div>
        <Link href="/organizer/events/new" className="btn btn-primary">
          + New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <p className="text-navy-700">No events yet. Create your first sign-up to get started.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {events.map((e) => {
            const theme = getTheme(e.themeKey);
            return (
              <li key={e.id}>
                <Link
                  href={`/organizer/events/${e.id}`}
                  className="card flex flex-col gap-3 border-l-4 p-4 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  style={{ borderLeftColor: theme.accent }}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold text-navy-900">{e.title}</h2>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-navy-700">
                      {formatEventDate(e.eventDate)} · {theme.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-6 text-sm text-navy-700">
                    <span>
                      <strong className="text-navy-900">{e.claimed}</strong> / {e.needed} covered
                    </span>
                    <span>
                      <strong className="text-navy-900">{e._count.signups}</strong> families
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
