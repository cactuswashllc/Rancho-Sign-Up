"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/app/organizer/(app)/actions";
import type { ItemAvailability } from "@/lib/signups";

type ItemAction = (prev: FormState, fd: FormData) => Promise<FormState>;

function ItemFields({ item, fe }: { item?: ItemAvailability; fe: FormState["fieldErrors"] }) {
  const e = fe ?? {};
  const uid = item?.id ?? "new";
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
      <div>
        <label htmlFor={`name-${uid}`} className="field-label">
          Item
        </label>
        <input
          id={`name-${uid}`}
          name="name"
          className="field"
          required
          maxLength={120}
          defaultValue={item?.name}
          placeholder="e.g. Juice boxes (10-pack)"
        />
        {e.name && <p className="field-error">{e.name[0]}</p>}
      </div>
      <div>
        <label htmlFor={`qty-${uid}`} className="field-label">
          Qty needed
        </label>
        <input
          id={`qty-${uid}`}
          name="quantityNeeded"
          type="number"
          inputMode="numeric"
          min={Math.max(1, item?.claimed ?? 0)}
          max={1000}
          required
          className="field"
          defaultValue={item?.quantityNeeded ?? 1}
        />
        {e.quantityNeeded && <p className="field-error">{e.quantityNeeded[0]}</p>}
      </div>
      <div>
        <label htmlFor={`notes-${uid}`} className="field-label">
          Notes <span className="font-normal text-navy-500">(optional)</span>
        </label>
        <input
          id={`notes-${uid}`}
          name="notes"
          className="field"
          maxLength={500}
          defaultValue={item?.notes}
          placeholder="e.g. Nut-free please"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`url-${uid}`} className="field-label">
          Amazon product link <span className="font-normal text-navy-500">(optional)</span>
        </label>
        <input
          id={`url-${uid}`}
          name="productUrl"
          type="url"
          inputMode="url"
          className="field"
          defaultValue={item?.productUrl ?? ""}
          placeholder="https://www.amazon.com/dp/…"
        />
        {e.productUrl && <p className="field-error">{e.productUrl[0]}</p>}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  index,
  count,
  updateAction,
  deleteAction,
  moveAction,
}: {
  item: ItemAvailability;
  index: number;
  count: number;
  updateAction: ItemAction;
  deleteAction: (prev: FormState) => Promise<FormState>;
  moveAction: (direction: "up" | "down") => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateAction, {});
  const [delState, delAction] = useActionState(deleteAction, {});

  // Close the editor after a successful save (adjust state during render,
  // keyed on the action result identity).
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) setEditing(false);
  }

  if (editing)
    return (
      <li className="py-4">
        <form action={formAction} className="space-y-3">
          <ItemFields item={item} fe={state.fieldErrors} />
          {state.error && <p className="field-error">{state.error}</p>}
          <div className="flex gap-2">
            <SubmitButton pendingText="Saving…">Save item</SubmitButton>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold text-navy-900">{item.name}</p>
        {item.notes && <p className="text-sm text-navy-700">{item.notes}</p>}
        <p className="mt-0.5 text-sm text-navy-700">
          <strong>{item.claimed}</strong> of {item.quantityNeeded} claimed
          {item.productUrl && " · has product link"}
        </p>
        {delState.error && <p className="field-error">{delState.error}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-1">
        <form action={moveAction.bind(null, "up")}>
          <button
            className="btn btn-ghost px-3"
            type="submit"
            disabled={index === 0}
            aria-label={`Move ${item.name} up`}
          >
            ↑
          </button>
        </form>
        <form action={moveAction.bind(null, "down")}>
          <button
            className="btn btn-ghost px-3"
            type="submit"
            disabled={index === count - 1}
            aria-label={`Move ${item.name} down`}
          >
            ↓
          </button>
        </form>
        <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
          Edit
        </button>
        <form action={delAction}>
          <SubmitButton className="btn btn-danger" pendingText="…">
            Delete
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}

export function ItemsEditor({
  items,
  addAction,
  updateAction,
  deleteAction,
  moveAction,
}: {
  items: ItemAvailability[];
  addAction: ItemAction;
  updateAction: (itemId: string, prev: FormState, fd: FormData) => Promise<FormState>;
  deleteAction: (itemId: string, prev: FormState) => Promise<FormState>;
  moveAction: (itemId: string, direction: "up" | "down") => Promise<void>;
}) {
  // React resets the uncontrolled "add" form after each submission.
  const [addState, add] = useActionState(addAction, {});

  return (
    <div>
      {items.length === 0 ? (
        <p className="mt-3 text-navy-700">No items yet — add the first one below.</p>
      ) : (
        <ul className="mt-2 divide-y divide-navy-100">
          {items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              index={i}
              count={items.length}
              updateAction={updateAction.bind(null, item.id)}
              deleteAction={deleteAction.bind(null, item.id)}
              moveAction={moveAction.bind(null, item.id)}
            />
          ))}
        </ul>
      )}

      <form action={add} className="mt-6 space-y-3 rounded-lg bg-navy-50 p-4 sm:p-5">
        <h3 className="font-semibold text-navy-900">Add an item</h3>
        <ItemFields fe={addState.fieldErrors} />
        {addState.error && <p className="field-error">{addState.error}</p>}
        <SubmitButton pendingText="Adding…">Add item</SubmitButton>
      </form>
    </div>
  );
}
