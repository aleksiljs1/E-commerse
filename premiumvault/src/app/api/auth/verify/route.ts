import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=invalid_link`);
  }

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=invalid_link`);
  }

  if (user.verificationExpiry && user.verificationExpiry < new Date()) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=link_expired&email=${encodeURIComponent(user.email)}`);
  }

  // Generate a short-lived auto-login token (10 minutes)
  const autoLoginToken = randomUUID();
  const autoLoginExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationExpiry: null,
      autoLoginToken,
      autoLoginExpiry,
    },
  });

  return NextResponse.redirect(`${appUrl}/auth/auto-login?t=${autoLoginToken}`);
}
