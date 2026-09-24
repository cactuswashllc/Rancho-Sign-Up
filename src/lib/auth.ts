import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { adminEmails, appUrl } from "./env";
import { buttonHtml, emailLayout, sendEmail } from "./email";
import { hashToken, newToken } from "./tokens";

export const SESSION_COOKIE = "rs_session";
const MAGIC_LINK_TTL_MS = 20 * 60 * 1000; // 20 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Find (or bootstrap) the active organizer for an email. Emails listed in
 * ADMIN_EMAILS are always allowed in as admins.
 */
export async function findAllowedOrganizer(email: string) {
  const normalized = email.trim().toLowerCase();
  if (adminEmails().includes(normalized)) {
    return db.organizer.upsert({
      where: { email: normalized },
      update: { role: "ADMIN", active: true },
      create: { email: normalized, role: "ADMIN" },
    });
  }
  const organizer = await db.organizer.findUnique({ where: { email: normalized } });
  return organizer?.active ? organizer : null;
}

/**
 * Email a one-time sign-in link if the address belongs to an organizer.
 * Always resolves the same way so callers can't probe which emails exist.
 */
export async function requestMagicLink(email: string): Promise<void> {
  const organizer = await findAllowedOrganizer(email);
  if (!organizer) return;

  const token = newToken();
  await db.magicLinkToken.create({
    data: {
      email: organizer.email,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
    },
  });
  const link = `${appUrl()}/organizer/verify?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: organizer.email,
    subject: "Your Rancho Solano PTO sign-in link",
    text: `Use this link to sign in to Rancho Solano PTO Sign-Ups. It expires in 20 minutes and can be used once.\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
    html: emailLayout(
      "Sign in to PTO Sign-Ups",
      `<p>Tap the button below to sign in. The link expires in 20 minutes and can be used once.</p>${buttonHtml(link, "Sign in")}<p style="font-size:13px;color:#5b6b7f">If you didn't request this, you can ignore this email.</p>`,
    ),
  });
}

/**
 * Consume a magic-link token and create a session. Returns the raw session
 * token for the cookie, or null if the link is invalid, used, or expired.
 */
export async function consumeMagicLink(token: string): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const now = new Date();
  const tokenHash = hashToken(token);
  // Atomic single-use: only one request can flip usedAt from null.
  const { count } = await db.magicLinkToken.updateMany({
    where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });
  if (count !== 1) return null;

  const link = await db.magicLinkToken.findUnique({ where: { tokenHash } });
  const organizer = link && (await findAllowedOrganizer(link.email));
  if (!organizer) return null;

  const sessionToken = newToken();
  await db.session.create({
    data: {
      tokenHash: hashToken(sessionToken),
      organizerId: organizer.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return sessionToken;
}

export async function setSessionCookie(sessionToken: string) {
  (await cookies()).set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function getCurrentOrganizer() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { organizer: true },
  });
  if (!session || session.expiresAt <= new Date() || !session.organizer.active) return null;
  return session.organizer;
}

/** Use at the top of every organizer page and server action. */
export async function requireOrganizer() {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/organizer/login");
  return organizer;
}

export async function requireAdmin() {
  const organizer = await requireOrganizer();
  if (organizer.role !== "ADMIN") redirect("/organizer");
  return organizer;
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}
