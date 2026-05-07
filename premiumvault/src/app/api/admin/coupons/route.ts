import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(1).transform((v) => v.trim().toUpperCase()),
  discountPct: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(1),
  expiresAt: z.string().transform((v) => new Date(v)),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });
    return NextResponse.json({ data: coupons });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing)
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });

    const coupon = await prisma.coupon.create({ data: parsed.data });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
