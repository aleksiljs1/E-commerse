import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";
import { z } from "zod";
import { emailSchema } from "@/lib/email-validation";

const schema = z.object({
  to: emailSchema,
  host: z.string().min(1),
  port: z.coerce.number(),
  secure: z.boolean(),
  user: z.string().min(1),
  pass: z.string().min(1),
  from: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { to, host, port, secure, user, pass, from } = parsed.data;

  try {
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

    await transporter.sendMail({
      from: `"PremiumVault" <${from}>`,
      to,
      subject: "PremiumVault — Test Email",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: #09090b; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">PremiumVault</h1>
    </div>
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">&#x2709;</div>
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0;">SMTP Test Successful</h2>
      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">
        Your email configuration is working correctly.<br>
        Host: <strong style="color: #ffffff;">${host}:${port}</strong>
      </p>
    </div>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to send test email" },
      { status: 500 }
    );
  }
}
