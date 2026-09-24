"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { requestLink, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(requestLink, {});
  if (state.sent)
    return (
      <div className="card p-6 text-center" role="status">
        <h2 className="heading text-2xl">Check your email</h2>
        <p className="mt-2 text-navy-700">
          If that address belongs to a PTO organizer, a sign-in link is on its way. It expires in 20 minutes.
        </p>
      </div>
    );
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label htmlFor="email" className="field-label">
          Organizer email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          className="field"
        />
      </div>
      {state.error && (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton className="btn btn-primary w-full" pendingText="Sending…">
        Email me a sign-in link
      </SubmitButton>
    </form>
  );
}
