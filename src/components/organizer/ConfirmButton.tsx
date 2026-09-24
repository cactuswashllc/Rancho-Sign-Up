"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

/** Two-step destructive button: first click asks, second click submits. */
export function ConfirmButton({
  action,
  label,
  confirmLabel,
}: {
  action: () => Promise<void>;
  label: string;
  confirmLabel: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" className="btn btn-danger shrink-0 self-start" onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  return (
    <form action={action} className="flex shrink-0 flex-wrap items-center gap-2">
      <span className="text-sm text-navy-800">{confirmLabel}</span>
      <SubmitButton className="btn btn-danger" pendingText="Working…">
        Yes
      </SubmitButton>
      <button type="button" className="btn btn-ghost" onClick={() => setAsking(false)}>
        No
      </button>
    </form>
  );
}
