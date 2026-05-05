import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
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
  if (!session || (session.user as any).role !== "ADMIN") return apiError("Forbidden", 403);

  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid status value", 400);

    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return apiError("Not found", 404);

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      return apiError(`Cannot transition from ${order.status} to ${parsed.data.status}`, 400);
    }

    const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === "P2025") return apiError("Not found", 404);
    return apiError("Internal server error", 500, "admin/orders/[id]/status PATCH", err);
  }
}
