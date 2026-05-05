import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "PAID", "CREDENTIALS_SUBMITTED", "COMPLETED", "CANCELLED"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status = VALID_STATUSES.includes(statusParam as any) ? statusParam as (typeof VALID_STATUSES)[number] : null;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
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
