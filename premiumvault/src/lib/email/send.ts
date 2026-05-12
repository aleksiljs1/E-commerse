import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { getEmailSettings } from "./settings";
import { escapeHtml } from "./html-escape";

export type EmailOptions = { to: string; subject: string; html: string; orderId?: string };

let _transporter: nodemailer.Transporter | null = null;
let _transporterSettings: string = "";

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [5, 15, 60, 240, 1440].map((m) => m * 60 * 1000);

export async function sendEmail({ to, subject, html, orderId }: EmailOptions): Promise<void> {
  const log = await prisma.emailLog.create({
    data: { to, subject, html, status: "PENDING", orderId: orderId ?? null },
  });
  await _attemptSend({ logId: log.id, to, subject, html, orderId, attempt: 0 });
}

export async function retryEmailLog(logId: string): Promise<void> {
  const log = await prisma.emailLog.findUnique({ where: { id: logId } });
  if (!log) throw new Error("EmailLog not found");
  await _attemptSend({
    logId: log.id,
    to: log.to,
    subject: log.subject,
    html: log.html,
    orderId: log.orderId ?? undefined,
    attempt: log.attempts,
  });
}

export async function _attemptSend({
  logId,
  to,
  subject,
  html,
  orderId,
  attempt,
}: {
  logId: string;
  to: string;
  subject: string;
  html: string;
  orderId?: string | null;
  attempt: number;
}): Promise<void> {
  const s = await getEmailSettings();
  const cacheKey = JSON.stringify({ host: s.host, port: s.port, secure: s.secure, user: s.user, pass: s.pass });
  if (_transporter === null || cacheKey !== _transporterSettings) {
    _transporter = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.secure,
      auth: { user: s.user, pass: s.pass },
    });
    _transporterSettings = cacheKey;
  }
  const transporter = _transporter;

  try {
    await transporter.sendMail({ from: `"PremiumVault" <${s.from}>`, to, subject, html });
    await prisma.emailLog.update({
      where: { id: logId },
      data: { status: "SENT", sentAt: new Date(), error: null },
    });
  } catch (err: any) {
    const code = err?.code;
    const detail =
      code === "ECONNREFUSED" ? `connection refused at ${s.host}:${s.port} — check host/port` :
      code === "EAUTH"        ? `authentication failed for ${s.user} — check credentials` :
      code === "ENOTFOUND"    ? `host not found: ${s.host}` :
      err?.message ?? "unknown SMTP error";

    console.error("[email/send] Failed to send to", to, "—", detail);

    const newAttempts = attempt + 1;
    const exhausted = newAttempts >= MAX_ATTEMPTS;
    const nextRetry = exhausted ? null : new Date(Date.now() + RETRY_DELAYS_MS[newAttempts - 1]);

    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: exhausted ? "EXHAUSTED" : "FAILED",
        error: detail,
        attempts: newAttempts,
        nextRetry,
      },
    });

    // Alert admin via raw nodemailer — does NOT go through sendEmail to avoid log loops
    if (s.adminNotificationEmail) {
      try {
        await transporter.sendMail({
          from: `"PremiumVault" <${s.from}>`,
          to: s.adminNotificationEmail,
          subject: `⚠️ Email delivery failed — ${to}`,
          html: `<body style="font-family:sans-serif;background:#09090b;color:#e4e4e7;padding:32px">
            <h2 style="color:#f87171;margin-bottom:16px">Email Delivery Failed</h2>
            <p><strong>To:</strong> ${escapeHtml(to)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Error:</strong> ${escapeHtml(detail)}</p>
            <p><strong>Attempts:</strong> ${newAttempts} / ${MAX_ATTEMPTS}</p>
            ${orderId ? `<p><strong>Order:</strong> ${escapeHtml(orderId)}</p>` : ""}
            ${nextRetry ? `<p><strong>Next retry:</strong> ${nextRetry.toISOString()}</p>` : "<p>No more retries scheduled.</p>"}
            <p style="margin-top:24px;color:#71717a;font-size:13px">Check the admin email logs page for details.</p>
          </body>`,
        });
      } catch {
        console.error("[email/send] Admin alert also failed for log", logId);
      }
    }

    throw new Error(`SMTP error: ${detail}`);
  }
}
