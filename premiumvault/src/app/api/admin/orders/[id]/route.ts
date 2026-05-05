import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return apiError("Forbidden", 403);

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { title: true, serviceType: true, logoUrl: true } },
            credentials: { select: { id: true, serviceType: true, username: true, status: true, submittedAt: true } },
          },
        },
      },
    });
    if (!order) return apiError("Not found", 404);
    return NextResponse.json(order);
  } catch (err) {
    return apiError("Internal server error", 500, "admin/orders/[id] GET", err);
  }
}
