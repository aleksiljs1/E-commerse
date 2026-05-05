import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { title: true, serviceType: true, logoUrl: true } },
          credentials: {
            select: { id: true, serviceType: true, username: true, status: true, submittedAt: true },
          },
        },
      },
    },
  });

  return NextResponse.json(orders);
}
