import nodemailer from "nodemailer";
import { getEmailSettings } from "./settings";

type EmailOptions = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const s = await getEmailSettings();

  const transporter = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure,
    auth: { user: s.user, pass: s.pass },
  });

  try {
    await transporter.sendMail({ from: `"PremiumVault" <${s.from}>`, to, subject, html });
  } catch (err: any) {
    const code = err?.code;
    const detail =
      code === "ECONNREFUSED" ? `connection refused at ${s.host}:${s.port} — check host/port` :
      code === "EAUTH"        ? `authentication failed for ${s.user} — check credentials` :
      code === "ENOTFOUND"    ? `host not found: ${s.host}` :
      err?.message ?? "unknown SMTP error";
    console.error("[email/send] Failed to send email to", to, "—", detail);
    throw new Error(`SMTP error: ${detail}`);
  }
}
