"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireOrganizer, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import * as events from "@/lib/events";
import {
  eventSchema,
  fieldErrors,
  itemSchema,
  organizerEmailSchema,
  type FieldErrors,
} from "@/lib/validation";

export interface FormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
}

function readEvent(fd: FormData) {
  return eventSchema.safeParse({
    title: fd.get("title") ?? "",
    eventDate: fd.get("eventDate") ?? "",
    location: fd.get("location") ?? "",
    description: fd.get("description") ?? "",
    themeKey: fd.get("themeKey") ?? "",
    amazonListUrl: fd.get("amazonListUrl") ?? "",
    status: fd.get("status") ?? undefined,
  });
}

function readItem(fd: FormData) {
  return itemSchema.safeParse({
    name: fd.get("name") ?? "",
    notes: fd.get("notes") ?? "",
    productUrl: fd.get("productUrl") ?? "",
    quantityNeeded: fd.get("quantityNeeded") ?? "",
  });
}

function refresh(eventId: string) {
  revalidatePath(`/organizer/events/${eventId}`);
}

export async function signOutAction() {
  await signOut();
  redirect("/organizer/login");
}

export async function createEventAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const organizer = await requireOrganizer();
  const parsed = readEvent(fd);
  if (!parsed.success)
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const event = await events.createEvent(parsed.data, organizer.id);
  redirect(`/organizer/events/${event.id}?created=1`);
}

export async function updateEventAction(eventId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireOrganizer();
  const parsed = readEvent(fd);
  if (!parsed.success)
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  await events.updateEvent(eventId, parsed.data);
  refresh(eventId);
  return { ok: true };
}

export async function setStatusAction(eventId: string, status: "DRAFT" | "OPEN" | "CLOSED") {
  await requireOrganizer();
  if (!["DRAFT", "OPEN", "CLOSED"].includes(status)) return;
  await db.event.update({ where: { id: eventId }, data: { status } });
  refresh(eventId);
}

export async function deleteEventAction(eventId: string) {
  await requireOrganizer();
  const urls = await events.deleteEvent(eventId);
  await deleteBlobs(urls);
  redirect("/organizer");
}

export async function addItemAction(eventId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireOrganizer();
  const parsed = readItem(fd);
  if (!parsed.success)
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  await events.addItem(eventId, parsed.data);
  refresh(eventId);
  return { ok: true };
}

export async function updateItemAction(
  eventId: string,
  itemId: string,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireOrganizer();
  const parsed = readItem(fd);
  if (!parsed.success)
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const result = await events.updateItem(eventId, itemId, parsed.data);
  if (!result.ok) return { error: result.error };
  refresh(eventId);
  return { ok: true };
}

export async function deleteItemAction(
  eventId: string,
  itemId: string,
  _prev: FormState,
): Promise<FormState> {
  await requireOrganizer();
  const result = await events.deleteItem(eventId, itemId);
  if (!result.ok) return { error: result.error };
  refresh(eventId);
  return { ok: true };
}

export async function moveItemAction(eventId: string, itemId: string, direction: "up" | "down") {
  await requireOrganizer();
  if (direction !== "up" && direction !== "down") return;
  await events.moveItem(eventId, itemId, direction);
  refresh(eventId);
}

/** Accept only images we uploaded to this project's Vercel Blob store. */
function isOurBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function addImageAction(eventId: string, url: string, alt: string): Promise<FormState> {
  await requireOrganizer();
  if (!isOurBlobUrl(url)) return { error: "Upload failed. Please try again." };
  await events.addImage(eventId, url, alt.trim().slice(0, 200));
  refresh(eventId);
  return { ok: true };
}

export async function removeImageAction(eventId: string, imageId: string) {
  await requireOrganizer();
  const url = await events.removeImage(eventId, imageId);
  if (url) await deleteBlobs([url]);
  refresh(eventId);
}

export async function makeCoverAction(eventId: string, imageId: string) {
  await requireOrganizer();
  await events.makeCoverImage(eventId, imageId);
  refresh(eventId);
}

export async function removeSignupAction(eventId: string, signupId: string) {
  await requireOrganizer();
  await events.removeSignup(eventId, signupId);
  refresh(eventId);
}

async function deleteBlobs(urls: string[]) {
  const blobs = urls.filter(isOurBlobUrl);
  if (blobs.length === 0 || !env().BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(blobs);
  } catch (err) {
    console.error("blob delete failed", err instanceof Error ? err.message : "unknown");
  }
}

// ── Organizer management (admins only) ─────────────────────────────────────

export async function addOrganizerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = organizerEmailSchema.safeParse(fd.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const name =
    String(fd.get("name") ?? "")
      .trim()
      .slice(0, 100) || null;
  const role = fd.get("role") === "ADMIN" ? "ADMIN" : "ORGANIZER";
  await db.organizer.upsert({
    where: { email: email.data },
    update: { active: true, role, name: name ?? undefined },
    create: { email: email.data, name, role },
  });
  revalidatePath("/organizer/team");
  return { ok: true };
}

export async function setOrganizerActiveAction(organizerId: string, active: boolean) {
  const me = await requireAdmin();
  if (organizerId === me.id) return; // don't lock yourself out
  await db.organizer.update({ where: { id: organizerId }, data: { active } });
  if (!active) await db.session.deleteMany({ where: { organizerId } });
  revalidatePath("/organizer/team");
}

export async function setOrganizerRoleAction(organizerId: string, role: "ADMIN" | "ORGANIZER") {
  const me = await requireAdmin();
  if (organizerId === me.id || (role !== "ADMIN" && role !== "ORGANIZER")) return;
  await db.organizer.update({ where: { id: organizerId }, data: { role } });
  revalidatePath("/organizer/team");
}
