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
  } catch (err) {
    console.error("[email/send] Failed to send email to", to, "subject:", subject, err);
    throw err;
  }
}
