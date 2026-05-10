import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { emailSchema } from "@/lib/email-validation";
import { sendEmail } from "@/lib/email/send";
import { emailVerificationTemplate } from "@/lib/email/templates/email-verification";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = randomUUID();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.user.create({
      data: { name, email, password: hashed, role: "USER", verificationToken, verificationExpiry },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const verifyUrl = `${appUrl}/api/auth/verify?token=${verificationToken}`;

    sendEmail({
      to: email,
      subject: "PremiumVault — Verify your email",
      html: emailVerificationTemplate({ name, verifyUrl }),
    }).catch((err) => console.error("[signup] Verification email failed:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
