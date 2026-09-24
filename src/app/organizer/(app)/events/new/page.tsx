import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/organizer/EventForm";
import { createEventAction } from "../../actions";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <>
      <Link href="/organizer" className="text-sm text-navy-700 hover:underline">
        ← All events
      </Link>
      <h1 className="heading mt-2 text-3xl">New event</h1>
      <p className="mt-1 text-navy-700">You can add items and photos on the next screen.</p>
      <div className="card mt-6 p-5 sm:p-8">
        <EventForm
          action={createEventAction}
          submitLabel="Create event"
          showStatus
          initial={{
            title: "",
            eventDate: "",
            location: "",
            description: "",
            themeKey: "classic",
            amazonListUrl: "",
            headerText: "",
            status: "DRAFT",
          }}
        />
      </div>
    </>
  );
}
