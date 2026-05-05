import { transporter } from "./transporter";

type EmailOptions = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  await transporter.sendMail({ from: `"PremiumVault" <${process.env.EMAIL_FROM}>`, to, subject, html });
}
