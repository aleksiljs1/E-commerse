import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { purchaseConfirmationTemplate } from "@/lib/email/templates/purchase-confirmation";

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get("x-internal-secret");
  if (internalSecret !== process.env.NEXTAUTH_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order || !order.credentialToken) return NextResponse.json({ error: "Order not found or no token" }, { status: 404 });
  await sendEmail({
    to: order.customerEmail,
    subject: `PremiumVault — Order ${order.orderNumber} Confirmed`,
    html: purchaseConfirmationTemplate({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      items: order.items.map((i) => ({ title: i.product.title, quantity: i.quantity, priceAtPurchase: Number(i.priceAtPurchase) })),
      totalAmount: Number(order.totalAmount),
      credentialToken: order.credentialToken,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    }),
  });
  return NextResponse.json({ success: true });
}
