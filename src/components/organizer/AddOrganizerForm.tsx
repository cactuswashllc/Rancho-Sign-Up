"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { addOrganizerAction, type FormState } from "@/app/organizer/(app)/actions";

export function AddOrganizerForm() {
  const [state, action] = useActionState<FormState, FormData>(addOrganizerAction, {});
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
      <div>
        <label htmlFor="org-name" className="field-label">
          Name
        </label>
        <input id="org-name" name="name" className="field" maxLength={100} />
      </div>
      <div>
        <label htmlFor="org-email" className="field-label">
          Email
        </label>
        <input id="org-email" name="email" type="email" required className="field" />
      </div>
      <div>
        <label htmlFor="org-role" className="field-label">
          Role
        </label>
        <select id="org-role" name="role" className="field" defaultValue="ORGANIZER">
          <option value="ORGANIZER">Organizer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <SubmitButton pendingText="Adding…">Add</SubmitButton>
      {state.error && <p className="field-error sm:col-span-4">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-emerald-800 sm:col-span-4" role="status">
          Added. They can now sign in at /organizer/login.
        </p>
      )}
    </form>
  );
}
