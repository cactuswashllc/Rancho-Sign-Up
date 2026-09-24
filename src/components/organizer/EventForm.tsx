"use client";

import { useActionState, useState } from "react";
import { MotifIcon } from "@/components/Motif";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeBanner } from "@/components/ThemeBanner";
import { getTheme, THEMES } from "@/lib/themes";
import type { FormState } from "@/app/organizer/(app)/actions";

export interface EventFormValues {
  title: string;
  eventDate: string;
  location: string;
  description: string;
  themeKey: string;
  amazonListUrl: string;
  headerText: string;
  status: "DRAFT" | "OPEN" | "CLOSED";
}

export function EventForm({
  action,
  initial,
  submitLabel,
  showStatus = false,
  headerImageUrl,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial: EventFormValues;
  submitLabel: string;
  /** Status is edited here only on create; the edit page uses dedicated buttons. */
  showStatus?: boolean;
  /** Current custom header image, shown in the live preview. */
  headerImageUrl?: string | null;
}) {
  const [state, formAction] = useActionState(action, {});
  const [v, setV] = useState(initial);
  const theme = getTheme(v.themeKey);
  const fe = state.fieldErrors ?? {};
  const set =
    (k: keyof EventFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  const err = (k: string) =>
    fe[k] ? (
      <p id={`${k}-err`} className="field-error">
        {fe[k]![0]}
      </p>
    ) : null;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="field-label">
            Event name
          </label>
          <input
            id="title"
            name="title"
            className="field"
            required
            maxLength={120}
            placeholder="e.g. 3rd Grade Halloween Party"
            value={v.title}
            onChange={set("title")}
            aria-invalid={!!fe.title}
          />
          {err("title")}
        </div>
        <div>
          <label htmlFor="eventDate" className="field-label">
            Date
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            className="field"
            required
            value={v.eventDate}
            onChange={set("eventDate")}
            aria-invalid={!!fe.eventDate}
          />
          {err("eventDate")}
        </div>
        <div>
          <label htmlFor="location" className="field-label">
            Location <span className="font-normal text-navy-500">(optional)</span>
          </label>
          <input
            id="location"
            name="location"
            className="field"
            maxLength={120}
            placeholder="e.g. Room 12 / Main Hall"
            value={v.location}
            onChange={set("location")}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">
            Description <span className="font-normal text-navy-500">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={4000}
            className="field"
            placeholder="Party details, drop-off instructions, allergy notes…"
            value={v.description}
            onChange={set("description")}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="amazonListUrl" className="field-label">
            Amazon gift list link <span className="font-normal text-navy-500">(optional)</span>
          </label>
          <input
            id="amazonListUrl"
            name="amazonListUrl"
            type="url"
            inputMode="url"
            className="field"
            placeholder="https://www.amazon.com/hz/wishlist/ls/…"
            value={v.amazonListUrl}
            onChange={set("amazonListUrl")}
            aria-invalid={!!fe.amazonListUrl}
          />
          <p className="mt-1 text-xs text-navy-500">
            Parents see one &ldquo;Buy on Amazon&rdquo; button that opens this list.
          </p>
          {err("amazonListUrl")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="headerText" className="field-label">
            Header text <span className="font-normal text-navy-500">(optional)</span>
          </label>
          <input
            id="headerText"
            name="headerText"
            className="field"
            maxLength={160}
            placeholder={theme.tagline}
            value={v.headerText}
            onChange={set("headerText")}
          />
          <p className="mt-1 text-xs text-navy-500">
            Shown under the event name in the header. Leave blank to use the theme&apos;s line.
          </p>
        </div>
        {showStatus && (
          <div>
            <label htmlFor="status" className="field-label">
              Status
            </label>
            <select id="status" name="status" className="field" value={v.status} onChange={set("status")}>
              <option value="DRAFT">Draft — only organizers can see it</option>
              <option value="OPEN">Open — parents can sign up</option>
              <option value="CLOSED">Closed — visible, no new sign-ups</option>
            </select>
          </div>
        )}
      </div>

      <fieldset>
        <legend className="field-label">Theme</legend>
        <input type="hidden" name="themeKey" value={v.themeKey} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {THEMES.map((t) => {
            const selected = t.key === v.themeKey;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setV((p) => ({ ...p, themeKey: t.key }))}
                aria-pressed={selected}
                className={`flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-navy-100 bg-white text-navy-900 hover:border-navy-300"
                }`}
              >
                <span style={{ color: t.accent }}>
                  <MotifIcon motif={t.motif} className="h-5 w-5 shrink-0" />
                </span>
                <span className="leading-tight">
                  {t.name}
                  <span className={`block text-xs ${selected ? "text-navy-300" : "text-navy-500"}`}>
                    {t.season}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 overflow-hidden rounded-lg" aria-label="Theme preview">
          <ThemeBanner theme={theme} imageUrl={headerImageUrl} compact>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: theme.accent }}>
              {theme.name}
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
              {v.title || "Your event name"}
            </p>
            <p className="mt-1 font-serif italic text-navy-100">{v.headerText || theme.tagline}</p>
          </ThemeBanner>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
        {state.ok && (
          <span className="text-sm font-medium text-emerald-800" role="status">
            Saved ✓
          </span>
        )}
        {state.error && (
          <span className="text-sm font-medium text-red-800" role="alert">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
