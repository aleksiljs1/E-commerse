import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).transform((v) => v.trim().toUpperCase()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Please enter a coupon code" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });

    if (!coupon)
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });

    if (!coupon.active)
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });

    if (new Date() > coupon.expiresAt)
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });

    if (coupon.timesUsed >= coupon.maxUses)
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      discountPct: coupon.discountPct,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
