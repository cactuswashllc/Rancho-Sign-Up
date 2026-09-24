import { db } from "./db";
import { appUrl } from "./env";
import { buttonHtml, emailLayout, escapeHtml, sendEmail } from "./email";
import { formatEventDate } from "./dates";

interface ConfirmationInput {
  to: string;
  parentName: string;
  studentName: string;
  event: { title: string; eventDate: Date; location: string | null; amazonListUrl: string | null };
  lines: { name: string; quantity: number }[];
  token: string;
  updated?: boolean;
}

export async function sendSignupConfirmation(input: ConfirmationInput) {
  const manageUrl = `${appUrl()}/signup/${encodeURIComponent(input.token)}`;
  const when = formatEventDate(input.event.eventDate);
  const verb = input.updated ? "updated" : "confirmed";

  const listText = input.lines.map((l) => `  • ${l.quantity} × ${l.name}`).join("\n");
  const listHtml = input.lines
    .map((l) => `<li style="margin:4px 0"><strong>${l.quantity} ×</strong> ${escapeHtml(l.name)}</li>`)
    .join("");
  const amazon = input.event.amazonListUrl;

  await sendEmail({
    to: input.to,
    subject: `Sign-up ${verb}: ${input.event.title}`,
    text: [
      `Hi ${input.parentName},`,
      ``,
      `Thank you! Your sign-up for ${input.event.title} (${when}) on behalf of ${input.studentName} is ${verb}.`,
      ``,
      `You're bringing:`,
      listText,
      ``,
      amazon ? `Buy on Amazon: ${amazon}\n` : ``,
      `Need to change or cancel? Use your private link: ${manageUrl}`,
    ].join("\n"),
    html: emailLayout(
      `Thank you, ${input.parentName}!`,
      `<p>Your sign-up for <strong>${escapeHtml(input.event.title)}</strong> on ${escapeHtml(when)}${
        input.event.location ? ` (${escapeHtml(input.event.location)})` : ""
      } on behalf of <strong>${escapeHtml(input.studentName)}</strong> is ${verb}.</p>
<p style="margin-bottom:4px">You're bringing:</p><ul style="padding-left:20px;margin-top:4px">${listHtml}</ul>
${amazon ? buttonHtml(amazon, "Buy on Amazon") : ""}
<p style="font-size:14px">Need to change or cancel? <a href="${escapeHtml(manageUrl)}" style="color:#13315c">Manage your sign-up</a>. Keep this email — the link is private to you.</p>`,
    ),
  });
}

/** Email failures must never undo a successful sign-up. */
export async function sendConfirmation(signupId: string, token: string, updated = false) {
  try {
    const signup = await db.signup.findUnique({
      where: { id: signupId },
      include: { event: true, items: { include: { item: true } } },
    });
    if (!signup) return;
    await sendSignupConfirmation({
      to: signup.parentEmail,
      parentName: signup.parentName,
      studentName: signup.studentName,
      event: signup.event,
      lines: signup.items.map((l) => ({
        name: l.item.name,
        quantity: l.quantity,
      })),
      token,
      updated,
    });
  } catch (err) {
    // Log the failure type only — never the parent's details.
    console.error("signup confirmation email failed", err instanceof Error ? err.message : "unknown");
  }
}
