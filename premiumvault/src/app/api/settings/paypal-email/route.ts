import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["paypal_ff_email", "paypal_me_username"] } },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  return NextResponse.json({
    email: map.get("paypal_ff_email") ?? "",
    paypalMeUsername: map.get("paypal_me_username") ?? "",
  });
}
