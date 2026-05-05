import { transporter } from "./transporter";

type EmailOptions = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({ from: `"PremiumVault" <${process.env.EMAIL_FROM}>`, to, subject, html });
  } catch (err) {
    console.error("[email/send] Failed to send email to", to, "subject:", subject, err);
    throw err;
  }
}
