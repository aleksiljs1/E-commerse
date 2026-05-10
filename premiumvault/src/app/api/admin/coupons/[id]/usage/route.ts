import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const orders = await prisma.order.findMany({
      where: { couponId: id, status: { not: "PENDING" } },
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: orders });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
