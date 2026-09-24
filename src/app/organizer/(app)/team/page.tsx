import type { Metadata } from "next";
import { AddOrganizerForm } from "@/components/organizer/AddOrganizerForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminEmails } from "@/lib/env";
import { setOrganizerActiveAction, setOrganizerRoleAction } from "../actions";

export const metadata: Metadata = { title: "Organizers" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const me = await requireAdmin();
  const organizers = await db.organizer.findMany({ orderBy: [{ active: "desc" }, { email: "asc" }] });
  const bootstrap = new Set(adminEmails());

  return (
    <>
      <p className="eyebrow">Admin</p>
      <h1 className="heading text-3xl">Organizers</h1>
      <p className="mt-1 max-w-2xl text-navy-700">
        People on this list can sign in with an emailed link and manage every event. Admins can also add and
        remove organizers.
      </p>

      <section className="card mt-6 p-5 sm:p-8">
        <h2 className="text-lg font-semibold">Add an organizer</h2>
        <AddOrganizerForm />
      </section>

      <section className="card mt-6 p-5 sm:p-8">
        <ul className="divide-y divide-navy-100">
          {organizers.map((o) => {
            const locked = o.id === me.id || bootstrap.has(o.email);
            return (
              <li
                key={o.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className={`font-medium ${o.active ? "text-navy-900" : "text-navy-500 line-through"}`}>
                    {o.name ? `${o.name} · ` : ""}
                    {o.email}
                  </p>
                  <p className="text-xs text-navy-500">
                    {o.role === "ADMIN" ? "Admin" : "Organizer"}
                    {!o.active && " · removed"}
                    {o.id === me.id && " · you"}
                    {bootstrap.has(o.email) && " · set in ADMIN_EMAILS"}
                  </p>
                </div>
                {!locked && (
                  <div className="flex gap-2">
                    <form
                      action={setOrganizerRoleAction.bind(
                        null,
                        o.id,
                        o.role === "ADMIN" ? "ORGANIZER" : "ADMIN",
                      )}
                    >
                      <button className="btn btn-ghost text-sm" type="submit">
                        {o.role === "ADMIN" ? "Make organizer" : "Make admin"}
                      </button>
                    </form>
                    <form action={setOrganizerActiveAction.bind(null, o.id, !o.active)}>
                      <button
                        className={o.active ? "btn btn-danger text-sm" : "btn btn-secondary text-sm"}
                        type="submit"
                      >
                        {o.active ? "Remove" : "Restore"}
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
