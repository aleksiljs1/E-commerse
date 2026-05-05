import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-error";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, select: { id: true, status: true, orderNumber: true } });
    if (!order) return apiError("Not found", 404);
    return NextResponse.json(order);
  } catch (err) {
    return apiError("Internal server error", 500, "orders/[id] GET", err);
  }
}
