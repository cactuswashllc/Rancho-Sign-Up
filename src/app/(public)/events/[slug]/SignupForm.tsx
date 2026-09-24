"use client";

import { useActionState, useMemo, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SubmitButton } from "@/components/SubmitButton";
import { GRADES } from "@/lib/grades";
import type { ItemAvailability } from "@/lib/signups";
import type { SignupFormState } from "./actions";

type Action = (prev: SignupFormState, formData: FormData) => Promise<SignupFormState>;

export function SignupForm({ items, action }: { items: ItemAvailability[]; action: Action }) {
  const [state, formAction] = useActionState(action, {});
  const [qty, setQty] = useState<Record<string, number>>({});
  const [parent, setParent] = useState({ parentName: "", parentEmail: "", studentName: "", grade: "" });

  const totalSelected = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);
  const itemsSelected = Object.values(qty).filter((q) => q > 0).length;
  const fe = state.fieldErrors ?? {};

  const setField = (k: keyof typeof parent) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setParent((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form action={formAction} className="relative" noValidate>
      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="heading text-2xl sm:text-3xl">
          What&apos;s needed
        </h2>
        <p className="mt-1 text-sm text-navy-700">Choose how many of each item you&apos;d like to bring.</p>

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const full = item.remaining <= 0;
            const err = state.itemErrors?.[item.id];
            return (
              <li
                key={item.id}
                className={`card flex flex-col gap-3 p-4 sm:p-5 ${err ? "border-red-700" : ""} ${full ? "bg-navy-50/60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-navy-900">{item.name}</h3>
                    {item.notes && <p className="mt-0.5 text-sm text-navy-700">{item.notes}</p>}
                  </div>
                  {full && (
                    <span className="shrink-0 rounded-full bg-navy-900 px-2.5 py-1 text-xs font-semibold text-white">
                      All claimed ✓
                    </span>
                  )}
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-navy-700">
                    <span>
                      {full
                        ? "Fully covered — thank you!"
                        : `${item.remaining} of ${item.quantityNeeded} still needed`}
                    </span>
                    <span>{item.claimed} claimed</span>
                  </div>
                  <ProgressBar
                    value={item.claimed}
                    max={item.quantityNeeded}
                    label={`${item.name} claimed`}
                  />
                </div>
                {!full && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-navy-700">I&apos;ll bring</span>
                    <QuantityStepper
                      name={`qty[${item.id}]`}
                      value={qty[item.id] ?? 0}
                      max={item.remaining}
                      onChange={(v) => setQty((q) => ({ ...q, [item.id]: v }))}
                      label={`Quantity of ${item.name}`}
                    />
                  </div>
                )}
                {err && (
                  <p className="field-error" role="alert">
                    {err} Please refresh to see the latest numbers.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="info-heading" className="card mt-10 p-5 sm:p-8">
        <h2 id="info-heading" className="heading text-2xl">
          Your information
        </h2>
        <p className="mt-1 text-sm text-navy-700">
          We&apos;ll email you a confirmation with a private link to change or cancel.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="parentName" className="field-label">
              Your name
            </label>
            <input
              id="parentName"
              name="parentName"
              className="field"
              autoComplete="name"
              required
              maxLength={100}
              value={parent.parentName}
              onChange={setField("parentName")}
              aria-invalid={!!fe.parentName}
              aria-describedby={fe.parentName ? "parentName-err" : undefined}
            />
            {fe.parentName && (
              <p id="parentName-err" className="field-error">
                {fe.parentName[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="parentEmail" className="field-label">
              Email
            </label>
            <input
              id="parentEmail"
              name="parentEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="field"
              required
              maxLength={254}
              value={parent.parentEmail}
              onChange={setField("parentEmail")}
              aria-invalid={!!fe.parentEmail}
              aria-describedby={fe.parentEmail ? "parentEmail-err" : undefined}
            />
            {fe.parentEmail && (
              <p id="parentEmail-err" className="field-error">
                {fe.parentEmail[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="studentName" className="field-label">
              Student&apos;s name
            </label>
            <input
              id="studentName"
              name="studentName"
              className="field"
              autoComplete="off"
              required
              maxLength={100}
              value={parent.studentName}
              onChange={setField("studentName")}
              aria-invalid={!!fe.studentName}
              aria-describedby={fe.studentName ? "studentName-err" : undefined}
            />
            {fe.studentName && (
              <p id="studentName-err" className="field-error">
                {fe.studentName[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="grade" className="field-label">
              Grade
            </label>
            <select
              id="grade"
              name="grade"
              className="field"
              required
              value={parent.grade}
              onChange={setField("grade")}
              aria-invalid={!!fe.grade}
              aria-describedby={fe.grade ? "grade-err" : undefined}
            >
              <option value="" disabled>
                Select a grade
              </option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {fe.grade && (
              <p id="grade-err" className="field-error">
                {fe.grade[0]}
              </p>
            )}
          </div>
        </div>
        {/* Honeypot — hidden from people, tempting to bots. */}
        <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-navy-100 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:shadow-lg">
        {state.error && (
          <p className="mb-2 text-sm font-medium text-red-800" role="alert">
            {state.error}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-navy-700" aria-live="polite">
            {totalSelected === 0 ? (
              "Nothing selected yet"
            ) : (
              <>
                <strong className="text-navy-900">{totalSelected}</strong> total across {itemsSelected} item
                {itemsSelected === 1 ? "" : "s"}
              </>
            )}
          </p>
          <SubmitButton pendingText="Signing up…" disabled={totalSelected === 0}>
            Sign up
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
