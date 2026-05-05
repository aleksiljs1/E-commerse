import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ORDER_STATUSES = ["PENDING", "PAID", "CREDENTIALS_SUBMITTED", "COMPLETED", "CANCELLED"] as const;
const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["CREDENTIALS_SUBMITTED", "CANCELLED"],
  CREDENTIALS_SUBMITTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status value" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(parsed.data.status)) {
      return NextResponse.json({ error: `Invalid transition from ${order.status} to ${parsed.data.status}` }, { status: 400 });
    }

    const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
