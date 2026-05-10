import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendEmail } from "@/lib/email/send";
import { emailVerificationTemplate } from "@/lib/email/templates/email-verification";
import { emailSchema } from "@/lib/email-validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, checkOnly } = body;

    if (!emailSchema.safeParse(email).success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Check if unverified (for the signin pre-check)
    if (checkOnly) {
      const unverified = !!user && !user.emailVerified && user.verificationToken !== null;
      return NextResponse.json({ unverified });
    }

    // Always return success to avoid email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const verificationToken = randomUUID();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationExpiry },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const verifyUrl = `${appUrl}/api/auth/verify?token=${verificationToken}`;

    sendEmail({
      to: email,
      subject: "PremiumVault — Verify your email",
      html: emailVerificationTemplate({ name: user.name ?? email, verifyUrl }),
    }).catch((err) => console.error("[resend-verify] Email failed:", err));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
