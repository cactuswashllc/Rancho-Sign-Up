"use client";

import { useActionState, useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SubmitButton } from "@/components/SubmitButton";
import type { ManageFormState } from "./actions";

interface Row {
  id: string;
  name: string;
  mine: number;
  /** Max this parent may hold: what's left plus what they already have. */
  max: number;
}

export function ManageForm({
  rows,
  save,
  cancel,
}: {
  rows: Row[];
  save: (prev: ManageFormState, fd: FormData) => Promise<ManageFormState>;
  cancel: () => Promise<void>;
}) {
  const [state, formAction] = useActionState(save, {});
  const [qty, setQty] = useState<Record<string, number>>(Object.fromEntries(rows.map((r) => [r.id, r.mine])));
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <form action={formAction}>
        <ul className="divide-y divide-navy-100">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-navy-900">{r.name}</p>
                <p className="text-xs text-navy-500">Up to {r.max} available to you</p>
                {state.itemErrors?.[r.id] && <p className="field-error">{state.itemErrors[r.id]}</p>}
              </div>
              <QuantityStepper
                name={`qty[${r.id}]`}
                value={qty[r.id] ?? 0}
                max={r.max}
                onChange={(v) => setQty((q) => ({ ...q, [r.id]: v }))}
                label={`Quantity of ${r.name}`}
              />
            </li>
          ))}
        </ul>
        {state.error && (
          <p className="mt-3 text-sm font-medium text-red-800" role="alert">
            {state.error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </div>
      </form>

      <div className="mt-8 border-t border-navy-100 pt-6">
        {confirming ? (
          <form action={cancel} className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-navy-800">Cancel your whole sign-up?</p>
            <SubmitButton className="btn btn-danger" pendingText="Cancelling…">
              Yes, cancel it
            </SubmitButton>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn btn-ghost px-0 text-red-800"
            onClick={() => setConfirming(true)}
          >
            Cancel my sign-up
          </button>
        )}
      </div>
    </div>
  );
}
