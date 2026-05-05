import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { credentialToken: token },
    include: {
      items: {
        include: { product: { select: { id: true, title: true, serviceType: true, logoUrl: true } } },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  if (order.status !== "PAID") return NextResponse.json({ error: "Credentials already submitted" }, { status: 409 });
  if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, items: order.items });
}
