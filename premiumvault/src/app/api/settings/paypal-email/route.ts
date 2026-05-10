import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "paypal_ff_email" },
  });

  return NextResponse.json({ email: setting?.value ?? "" });
}
