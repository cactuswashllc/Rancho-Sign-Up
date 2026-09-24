import { Resend } from "resend";
import { env, isProductionDeploy } from "./env";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send an email through Resend. Without RESEND_API_KEY (local dev / tests)
 * the message is printed to the server console instead, never on production.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  if (!RESEND_API_KEY) {
    if (isProductionDeploy()) throw new Error("RESEND_API_KEY is not configured");
    console.info(`[email:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: EMAIL_FROM, ...msg });
  if (error) throw new Error(`Email send failed: ${error.name}`);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Simple navy-and-white email shell (inline styles for email clients). */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6fa;font-family:Helvetica,Arial,sans-serif;color:#0b2545">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #d9e2ec">
<tr><td style="background:#0b2545;padding:20px 28px;color:#ffffff;font-family:Georgia,serif;font-size:18px;letter-spacing:1px">RANCHO SOLANO PREPARATORY SCHOOL<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#8da9c4;margin-top:4px">PTO SIGN-UPS</div></td></tr>
<tr><td style="padding:28px">
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr></table></td></tr></table></body></html>`;
}

export function buttonHtml(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#0b2545;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;font-weight:bold">${escapeHtml(label)}</a></p>`;
}
